import axios from 'axios'


const api = axios.create({
    baseURL:'http://192.168.3.48:3333'
})


export {api}