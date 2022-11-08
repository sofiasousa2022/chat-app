const path = require ('path')
const express = require ('express') 
const http = require('http') // Load do módulo HTTP para podermos criar um servidor
const socketio = require('socket.io') 
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')

const app = express()
const server = http.createServer(app) // Configuração de um servidor fora da livraria app, que vai usar a app
const io = socketio(server) // Quando fazemos da livraria recebemos uma função que é a que usamos para por o socket.io a funcionar. Foi por isso que tivemos que criar o server e não podiamos usar a app, porque o socket.io precisa de receber um servidor http, e quando o express cria o servidor (behind the scenes) n´so não temos a variavel para o passar. Foi o mesmo que acontecer para podermos usar o middleware, tivemos que criar um schema separado.

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => { //imprimir uma mensagem no terminal quando um cliente se conectar ao servidor. conseguimos isso atraves do evento on e com o nome do evento, neste caso, connection
    console.log('New websocket connection')

    socket.on('join', (options, callback) => {
        const { error, user} = addUser({id: socket.id, ...options}) // Adicionar o User. socket.id > id daquela ligação
        
        if (error) {
            return callback(error)
        }
        
        // Se não der erro em cima então prossegue para o resto do codigo
        socket.join(user.room) // só podemos usar este metodo no servidor. Este método permite emitir eventos só para aquele room. Desta forma só os clientes daquele room é que vão ver as msg etc
        
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))// Envia mensagem para todos execpto a pessoa que se conecta
        
        io.to(user.room).emit('roomData', { // evento para enviar todos os utilizadores e sala
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('sendMessage', (clientMessage, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter() // Para aceder aos metodos do filtro temos que o colocar numa variavel
        if (filter.isProfane(clientMessage)) { // vamos obter true se for profane e false otherwise
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, clientMessage))
        callback()
    })

    socket.on('sendLocation', (local, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${local.latitude},${local.longitude}`))
        callback()
    })

    socket.on('disconnect', () => { // Permite saber qd alguem se desconecta
        const user = removeUser(socket.id) // Remove User

        if (user) { // So se existir o user é que enviamos o evento
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`)) // Aqui n é preciso ser broadcast porque temos certeza que a pessoa q se desconcta n vai receber a msg
            
            io.to(user.room).emit('roomData', { // evento para enviar todos os utilizadores e sala
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
}) 


server.listen(port, () => { // iniciar o servidor que criamos e não a app
    console.log('server is up on port ' + port)
})