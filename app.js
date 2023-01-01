const {
    default: makeWASocket,
	DisconnectReason,
    useSingleFileAuthState
} =require("@adiwajshing/baileys");

const {state, saveState} = useSingleFileAuthState("./auth_info.json");
const { Boom } =require("@hapi/boom");
const app = require("express")();
const bodyParser = require('body-parser');
const server = require("http").createServer(app);
const port = process.env.PORT || 8888;

app.use(bodyParser.json());

async function connectToWhatsApp () {

    const sock = makeWASocket({
        // can provide additional config here
        auth: state,
        printQRInTerminal: true
    })
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')


            //API REQ
            const token="dXBpbG1ldGVvcg=="
            app.get('/send', (req, res) => {

                let nohp = req.query.nohp;
                const pesan = req.query.pesan;
                let tokenin = req.query.token;
                console.log(nohp,pesan);

                if (tokenin !== token){
                    console.log("error! invalid token");
                    return res.status(401).json({status:"error",pesan:"invalid token"});
                }else{
                    try{
                        if(nohp.startsWith("0")){
                            nohp = "62" + nohp.slice("1") + '@s.whatsapp.net';
                        }else if(nohp.startsWith("62")){
                            nohp = nohp + '@s.whatsapp.net';
                        }else{
                            nohp = "62" + nohp + '@s.whatsapp.net';
                        }

                            sock.sendMessage(nohp, {text: pesan});
                            res.json({status:"berhasil terkirim", pesan});

                    }catch(error){
                        console.log(error);
                        res.status(500).json({status:"error",pesan: "error server"});
                        console.log(nohp,pesan);
                    }
                }

            })

            app.post('/send', (req, res) => {

                let nohp = req.body.nohp;
                const pesan = req.body.pesan;
                let tokenin = req.body.token;
                console.log("req - " + nohp,pesan);

                if (tokenin !== token){
                    console.log("error! invalid token");
                    return res.status(401).json({status:"error",pesan:"invalid token"});
                }else{
                    try{
                        if(nohp.startsWith("0")){
                            nohp = "62" + nohp.slice("1");
                        }else if(nohp.startsWith("62")){
                            nohp = nohp;
                        }else{
                            nohp = "62" + nohp;
                        }

                        //cek no terdaftar WA
                        const user = sock.onWhatsApp(nohp);
                        user.then(function([result]) {
                            console.log(result)

                            if (result===undefined){
                                res.json({status:"gagal", pesan : "no tidak terdaftar wa"});
                                console.log("gagal , " + nohp,pesan);
                            }else if (result.exists) {
                                sock.sendMessage(nohp + '@s.whatsapp.net', {text: pesan});//kirim
                                res.json({status:"berhasil terkirim", pesan});
                                console.log("res - " + nohp,pesan);
                            }else{
                                res.json({status:"error", pesan : "error"});
                                console.log("error");
                            }

                         })
                         //end cek

                    }catch(error){
                        console.log(error);
                        res.status(500).json({status:"error",pesan: "error server"});
                        console.log(nohp,pesan);
                    }
                }

            })
            //end API REQ
            
        }
    })


    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if(!messages[0].key.fromMe) {
            const id = messages[0].key.remoteJid;
            const pesan = messages[0].message.conversation;
            const pesanMasuk = pesan.toLowerCase();

            await sock.readMessages([messages[0].key]);

            if(!messages[0].key.fromMe && pesanMasuk === "tes"){
                await sock.sendMessage(id, {text: "Alive"},{quoted: messages[0] });
            }
        }
        
    })

    
}
// run in main file
connectToWhatsApp()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

server.listen(port, () => {
  console.log("Server Live On Port : " + port);
});

