	const users = []

    // addUser (Adicionar um user) 
    const addUser = ({id, username, room}) => {  // Esta função vai receber como parametro um objecto com o id (que é o id do socket), username e room
        // Clean the data (fazer o trim e transformar em minusculas)
        username = username.trim().toLowerCase()
        room = room.trim().toLowerCase()

        // Validate the data (se existe ou não o par username e room. NOTA: || quer dizer OR)
        if (!username || !room) {
            return {
                error: 'Username and room are required'
            }
        }
        
        // Check for existing User
        const existingUser = users.find((user) => { // NOTA: && >> E
            return user.room === room && user.username === username // Verificar se já existe o utilizador naquela sala, se sim vai devolver true
        })

        // Validate username
        if (existingUser) { // Se o existingUser der verdadeiro então não é suposto gravar o nome e deve apresentar este erro.
            return {
                error: 'Username is in use!'
            }
        }

        // Se passar em todas as condições definidas acima, então vai ser gravado
        const user = { id, username, room }
        users.push(user)
        return { user }
    }

    // removerUser (quando ele sai da sala)
    const removeUser = (id) => { 
        const index = users.findIndex((user)=> { //é muito parecido com o método find acima, mas em vez de devolver o array devolve a posição do id no array (vai ser -1 se não encontrar o resultado e 0 ou + se encontrar)
            return user.id === id // retorna true qd o user.id é igual ao id que entra. 
        }) 

        if (index !== -1) { // Se for diferente de -1 quer dizer que encontrou um match e sendo assim vai eliminálo do array
            return users.splice(index, 1)[0] // Elimina atraves do método splice que elimina atraves da posição (neste caso index) e o segundo argumeno é quantos queremos eliminar, neste caso 1. Se tivesse assim ia devolver um array dos users removidos (users.splice(index, 1)) mas neste caso queremos um objecto do user que foi removido, e como sabemos que foi só um, podemos fazer: users.splice(index, 1)[0]
        }
    }

    // getUser
    const getUser = (id) => { 
        const user = users.find((user)=> { 
            return user.id === id  
        }) 

        if (!user) { 
            return undefined
        }

       return user 
    }

    // getUsersInRoom
    const getUsersInRoom = (room) => {
        room = room.trim().toLowerCase()
        const UsersRoom = users.filter((user) => {
            return user.room === room
        })

        return { UsersRoom } 
    }


    module.exports = {
        addUser,
        removeUser,
        getUser,
        getUsersInRoom
    }