const WechatyBuilder = require('wechaty').WechatyBuilder
const QRCodeTerminal = require('wechaty-plugin-contrib').QRCodeTerminal
let axios = require("axios")
const config = { small: true }
let memosAPI = process.env.MEMOS_API
let wechatSender = process.env.WECHAT_SENDER
if (!memosAPI) {
    console.log('Memos API not defined,exist!!')
    process.exit(1)
    return
}
console.log(memosAPI)
const wechaty = WechatyBuilder.build() // get a Wechaty instance
wechaty
    .on('scan', (qrcode, status) => {
        console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
    })
    .on('login', user => console.log(`User ${user} logged in`))
    .on('message', message => {
        console.log(`Message: ${message}`);
        onMessage(message);
    })
wechaty.use(QRCodeTerminal(config))
wechaty.start()
process.on('exit', () => {
    wechaty.logout()
})
function onMessage(message) {
    let contact = message.talker()
    if (!contact) {
        return
    }
    contact = contact.name()
    console.log('sender', contact)
    if (wechatSender && contact !== wechatSender) {
        console.log("Not wechat send:", wechatSender, 'Skip')
        return
    }
    let text = message.payload && message.payload.text
    if (!text || !text.startsWith('memos')) {
        console.log("Skip Useless Message:", text)
        return
    }
    text = text.replace(/memos/, '')
    if (!text) {
        console.log("Skip Empty Content", text)
        return
    }
    axios.post(memosAPI, { content: text }).then(it => {
        console.log(it.data.data.rowStatus)
    }).catch(e => {
        console.log(e)
    })
}