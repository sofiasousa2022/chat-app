const socket = io()

// Elements:
const $messageForm = document.querySelector('#message-form') // Form 
const $messageFormInput = $messageForm.querySelector('input') // input
const $messageFormButton = $messageForm.querySelector('button') // button
const $messageFormButtonLocal = document.querySelector('#send-location') // button da localização
const $messages = document.querySelector('#messages') // div message
const $sidebar = document.querySelector('#sidebar') // div sidebar

// Templates:
const messageTemplate = document.querySelector('#message-template').innerHTML // queremos o valor HTML dentro (innerHTML)
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options:
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true}) // qs.parse vai devolver um objecto em que as propriedades são os parses do URL: http://localhost:3000/chat.html?username=Sofia&room=ITCENTER 

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Welcome
socket.on('message', (message) => { //recebe evento do servidor
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, //porque agora é um objecto
        createdAt: moment(message.createdAt).format('h:mm a')
    }) // mensagem do formulario <script>
    $messages.insertAdjacentHTML('beforeend', html) // apresentar a mensagem do formulario no div
    autoscroll()
})

// Evento listener do geolocation
socket.on('locationMessage', (info) => { //recebe evento do servidor
    console.log(info)
    const html = Mustache.render(locationTemplate, {
        username: info.username,
        location: info.location,
        createdAt: moment(info.createdAt).format('h:mm a')
    }) // mensagem do formulario <script>
    $messages.insertAdjacentHTML('beforeend', html) // apresentar a mensagem do formulario no div*/
    autoscroll()
})

// Evento listen roomData
socket.on('roomData', ({room, users}) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

// MENSAGEM
//document.querySelector('#message-form').addEventListener('submit', (e) => { // emitir um evento chamado click
$messageForm.addEventListener('submit', (e) => { // emitir um evento chamado click
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') // desabilitar  o form assim que for submito, atraves de setAttribute('disable', 'disable')

    const clientMessage = e.target.elements.message.value  //e.target.element conseguimos o form e depois passamos o id do elemento do form que queremos
    socket.emit('sendMessage', clientMessage, (error) => {  // enviar a mensagem para o servidor com knowolage
        $messageFormButton.removeAttribute('disabled') // Permite remover o atributo atraves do nome, neste caso vai voltar  a habilitar o botão
        $messageFormInput.value = '' // Colocar o valor do input sem nada, ou seja apagar o que estava
        $messageFormInput.focus() 

        if (error) { // Como a função callback só vai devolver erro, caso não haja erro devolve vazio podemos fazer esta condição que vai apresentar o erro e em caso contrario apresenta 
            return console.log(error)
        }
        console.log('Message delivered')
    })
})


// GEOLOCATION
$messageFormButtonLocal.addEventListener('click', () => {
    if (!navigator.geolocation) {  // Nem todos os browsers permitem geolocalização, para saber se permitem temos a propriedade navigator.geolocation
        return alert('Geolocation is not suported by your browser') // Se não suportar geolocation
    }

    $messageFormButtonLocal.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=> { // navigator.geolocation.getCurrentPosition e asyncrona mas n suporta promisses pelo que temos que fazer pela callback
        const local = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        
        socket.emit('sendLocation', local, () => {
            console.log('Location shared')
            $messageFormButtonLocal.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) => {  // Emitir evento para o servidor receber esta informação do join the room
    if(error) { // Se a callback devolver um erro então vamos devolver esse erro como alert para o utilizador ver e depois redireciona lo para a pagina
        alert(error)
        location.href= '/' // '/' > enviar para a root page
    }
})

