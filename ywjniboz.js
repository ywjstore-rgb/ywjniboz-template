const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const readline = require("readline")
const fs = require("fs")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (q) => new Promise(res => rl.question(q, res))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_ywjniboz")
  const sock = makeWASocket({ auth: state, printQRInTerminal: false })
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect } = u
    if (connection === "connecting" && !sock.authState.creds.registered) {
      const phone = await question("Masukkan nomor WhatsApp (misal: 628123...): ")
      const code = await sock.requestPairingCode(phone)
      console.log("\nKode Pairing WA:", code)
      console.log("Masuk ke WhatsApp > Perangkat Tertaut > Tautkan perangkat > Masukkan kode\n")
    } else if (connection === "open") {
      console.log("✅ Login sukses!")
      menu(sock)
    } else if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(shouldReconnect ? "⏳ Reconnecting..." : "🚪 Logged out. Hapus folder auth_ywjniboz jika perlu login ulang.")
      if (shouldReconnect) startBot()
    }
  })
}

async function menu(sock) {
  console.log(`
=========================
     YWJNihBoz WhatsApp
=========================
[1] Broadcast ke daftar (target.txt)
[2] Broadcast ke grup
[3] DM anggota grup
[0] Keluar
  `)
  const opt = await question("Pilih menu: ")
  if (opt === "0") return process.exit()
  console.log(`Fitur [${opt}] masih dalam pengembangan…`)
  menu(sock)
}

startBot()
