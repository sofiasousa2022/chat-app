const generateMessage = (username, text) => {
    return { 
        username,
        text: text,
        createdAt: new Date().getTime()
    }
} 

const generateLocationMessage = (username, local) => {
    return {
        username,
        location: local,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}