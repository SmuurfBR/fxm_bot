const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");

var preMessages = require("./Database/mensagens.json")
var config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
var banned = JSON.parse(fs.readFileSync("./Database/banidos.json", "utf8"));
var warneds = JSON.parse(fs.readFileSync("./Database/avisados.json", "utf8"))
var changelog = JSON.parse(fs.readFileSync("./Database/changelog.json", "utf8"))

var muted = new Set();
var warnResponse = new Set();

let whoWarned
let toWarn
let reason

const hexBranco = "#ffffff"
const hexPreto = "#000000"
const hexVermelho = "#ff0000"
const hexVerde = "#00ff00"
const hexAzul = "#0000ff"
const hexAmarelo = "#ffff00"
const hexRosa = "#ff00ff"
const hexLaranja = "#ff6e00"


var d1f = "https://youtu.be/gW8FbixbI-s"
// ==================================================================================================

// ==================================================================================================

function configSave(){
    fs.writeFile("./config.json", JSON.stringify(config), (err) => {
        if (err) console.error(err)
      });
}

function bannedSave(){
    fs.writeFile("./Database/banidos.json", JSON.stringify(banned), (err) => {
        if (err) console.error(err)
      });
}

function warnedsSave(){
    fs.writeFile("./Database/avisados.json", JSON.stringify(warneds), (err) => {
        if (err) console.error(err)
      });
}

function changelogSave(){
    fs.writeFile("./Database/changelog.json", JSON.stringify(changelog), (err) => {
        if (err) console.error(err)
    });
}

function checkAdmin(message){
    if (message.member.roles.some(r => ["Dono", "Admin"].includes(r.name))){
        return true
    }
    else if (message.member.roles.some(r => ["Moderadores"].includes(r.name))) randomMessage("", "lowPerms")
    else {
        message.channel.send(randomMessage("" , "perms"))
        return false
    }
}
function checkMod(message){
    if (message.member.roles.some(r => ["Dono", "Moderadores", "Admin"].includes(r.name))){
        return true
    }
    else {
        message.channel.send(randomMessage("" , "perms"))
        return false
    }
}

function hoursToMilSecs(hours){
    let mins = hours * 60
    let seconds = mins * 60
    let milSeconds = seconds * 1000
    return milSeconds
}
function minsToMilSecs(mins){
    let seconds = mins * 60
    let milSeconds = seconds * 1000
    return milSeconds
}
function secsToMilSecs(secs){
    let milSeconds = secs * 1000
    return milSeconds
}

function randomMessage(type1, type2){
    switch (type1){
        //preMessages.error
        default:
            switch (type2){
                //preMessages.error.perms
                case "perms":
                    return preMessages.error.perms[Math.floor(Math.random() * preMessages.error.perms.length)]
                break;
                case "lowPerms":
                    return preMessages.error.lowPerms[Math.floor(Math.random() * preMessages.error.lowPerms.length)]
                break;
                //preMessages.error.default
                default:
                    return preMessages.error.default[Math.floor(Math.random() * preMessages.error.default.length)]
                break;
            }
        break;
    }
}

function warn(message){
    let warnEmbed = new Discord.RichEmbed()
        .setAuthor("FXM Bot Alert", config.botImg)
        .setTitle("Aviso para " + toWarn.user.username)
        .setColor(hexAmarelo)
        .setTimestamp()
        .setDescription(whoWarned + " o avisou por: " + reason)
        .addField("Para remover o aviso, utilize " + config.prefix + "removewarn", toWarn.id)
        .setThumbnail(toWarn.user.avatarURL)
    warneds[toWarn.id] = {
        whoWarned: whoWarned,
        reason: reason,
        embed: warnEmbed
    }
    warnedsSave()
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    toSend.send({embed: warnEmbed})
    message.channel.send({embed: warnEmbed})
}
// ==================================================================================================

// ==================================================================================================

client.on("ready", () =>{
    client.user.setPresence({game:{name: config.prefix + "help", type: 0}});
    console.log(" ")
    console.log(" ")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    console.log("Ready and Running c:")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    console.log(" ")
    console.log(" ")
});
client.on("message", (message) =>{
    var args = message.content.toLowerCase().split(" ");
// Sem prefixo abaixo
    if(muted.has(message.author.id)){
        message.delete()
        return;

    }
    if(warnResponse.has(message.author.id)){
        if (message.content.includes("sim")){
            warn(message)
            warnResponse.delete(message.author.id)
        }
        else if (message.content.includes("não")){
            warnResponse.delete(message.author.id)
            message.channel.send("Cancelado com sucesso e sem falhas, óbvio")
        }
        else {
            message.channel.send(preMessages("", ""))
        }
        return;
    }
    if(!message.content.startsWith(config.prefix) || message.author.bot) return;
    
        
    var command = args[0]
    command = command.slice(config.prefix.length);
    args.shift()
    

    switch (command){
// Com prefixo abaixo


            // ======================================================================================
            // COMANDOS
            // ======================================================================================
        case "waffle":
            message.channel.send("Aqui está: " + d1f);
        break;
            //8ball
        case "8ball":
            if (args[0] == undefined){
                message.channel.send("Você precisa me perguntar algo")
                return;
            }
            message.reply(preMessages.eightBall[Math.floor(Math.random() * preMessages.eightBall.length)])
        break;

            //invite
        case "invite":
            message.channel.send("Aqui está: " + config.invite + " c:")
        break;

            // ======================================================================================
            // EMBEDS
            // ======================================================================================
        case "info":
            let embed = new Discord.RichEmbed()
                .setAuthor(config.author[0] , config.author[1])
                .setColor(hexBranco)
                .setTitle("Versão: " + config.version)
                .setDescription(config.developed)
                .addField("Pacotes NPM", config.packages, true)
                .addField("Banco de dados", config.database, true)
                .setThumbnail(config.botImg)
                .setFooter(config.compiled)
            message.channel.send({embed})
                
        break;
        case "help":
            if (args[0] !== undefined){
                let cmdHelp = args[0]
                message.channel.send("`" + config.prefix + args[0] + config.help[cmdHelp].moreInfo)
                return;
            }
            else{
                var helpEmbed = new Discord.RichEmbed()
                    .setTitle("Todos os comandos estão listados abaixo")
                    .setDescription("Para adquirir mais informações, digite " + config.prefix + "help e o comando")
                    .setColor(hexBranco)
                    .setThumbnail(config.botImg)
                
                var help = config.help.commands.forEach(c =>{
                    helpEmbed.addField(c, config.help[c].info)
                    
                })
                message.channel.send({embed:helpEmbed})
        }
            
        break;

        case "helpadm":
            if (args[0] !== undefined){
                let cmdHelp = args[0]
                message.channel.send("`" + config.prefix + args[0] + config.helpAdm[cmdHelp].moreInfo)
                return;
            }
            else{
                var helpAdmEmbed = new Discord.RichEmbed()
                    .setTitle("Todos os comandos estão listados abaixo")
                    .setDescription("Para adquirir mais informações, digite " + config.prefix + "helpadm e o comando")
                    .setColor(hexBranco)
                    .setThumbnail(config.botImg)
                
                var help = config.helpAdm.commands.forEach(c =>{
                    helpAdmEmbed.addField(c, config.helpAdm[c].info)
                    
                })
                message.channel.send({embed:helpAdmEmbed})}
        break;
        
        case "changelog":
                if(args[0] == undefined){
                    let embed = new Discord.RichEmbed()
                        .setColor(hexBranco)
                        .setTitle("Changelog")
                        .setDescription("Para mais informações, digite " + config.prefix + "changelog e a versão desejada.")
                    for(let i = 0; i <= 4; i++){
                        let version = changelog.versions[i]
                        embed.addField("Versão: "+ version, changelog[version].short)
                    }
                    message.channel.send({embed})
                }
                else if (args[0] == "add"){
                    if (checkAdmin(message)){
                        
                        let fullDesc = args.slice(2).join(" ") 
                        let dividedDesc = fullDesc.split(":")
                        let version = args[1]

                        if (args[1] == undefined){
                            message.channel.send("Você precisa inserir uma versão")
                            return;
                        }
                        if (!fullDesc.includes(":")){
                            message.channel.send("Você precisa inserir o caractere separador \":\"")
                            return;
                        }
                        if (dividedDesc[0] == undefined){
                            message.channel.send("Você precisa inserir uma descrição curta")
                            return;
                        }
                        if (dividedDesc[1] == undefined){
                            message.channel.send("Você precisa inserir uma descrição detalhada")
                            return;
                        }
                        if (!changelog[version]) {
                            changelog[version] = {
                                short: dividedDesc[0],
                                long: dividedDesc[1]
                            }
                            changelog.versions.unshift(version)
                            changelogSave()
                            message.channel.send("Versão adicionada no changelog")
                            return;
                        }
                    }
                }
                else {
                    function versionToCheck(value){
                        return value == args[0]
                    }
                    let version = changelog.versions.filter(versionToCheck)
                    if(version[0]== undefined){
                        message.channel.send("Essa não é uma versão válida")
                        return;
                    }
                    message.channel.send("Versão " + version + ": " + changelog[version].long)
                }
        break;
        
        
            // ======================================================================================
            // ADMINISTRAÇÃO
            // ======================================================================================
            // WARN
        case "warn":
                if(checkMod(message)){
                    if(message.mentions.members.size == 0){
                        message.channel.send("Você precisa mencionar um membro")
                        return;
                    }
                    if(toWarn.id == message.author.id){
                        message.channel.send("Você não pode se avisar")
                        return;
                    }
                    if(args[1] == undefined){
                        message.channel.send("Você precisa especificar um motivo")
                        return;
                    }
                    whoWarned = message.author.username + " #" + message.author.discriminator
                    toWarn = message.mentions.members.first()
                    reason = args.slice(1).join(" ")

                    if(warneds[toWarn.id]){
                        message.channel.send("Este membro já tem um aviso, deseja criar outro aviso? Isso irá sobescrever o existente")
                        message.channel.send({embed: warneds[toWarn.id].embed})
                        message.channel.send("Digite \"sim\" para prosseguir, você tem 30 segundos para fazer isso")
                        message.channel.send("Digite \"não\" para cancelar, você tem 30 segundos para fazer isso")
                        warnResponse.add(message.author.id)
                        setTimeout(() =>{
                            warnResponse.delete(message.author.id)
                        }, secsToMilSecs(30))
                        return;
                    }
                    warn(message)
                }
        break;

            // REMOVE WARN
        case "removewarn":
                if(checkAdmin(message)){
                    let whoRemoved = message.author.username + " #" + message.author.discriminator
                    let toRemove = message.mentions.members.first()
                    let reason = args.slice(1).join(" ")

                    if(message.mentions.members.size == 0){
                        message.channel.send("Você precisa mencionar um membro")
                        return;
                    }
                    if(toRemove.id == message.author.id){
                        message.channel.send("Você não pode remover seu próprio aviso")
                        return;
                    }
                    if(!warneds[toRemove.id]){
                        message.channel.send("Esse membro não tem um aviso ainda")
                        return;
                    }
                    if (args[1] == undefined){
                        message.channel.send("Você precisa especificar um motivo")
                        return;
                    }
                    delete warneds[toRemove.id]
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                    let embed = new Discord.RichEmbed()
                        .setTitle("Remoção de aviso")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(toRemove.user.avatarURL)
                        .setDescription(whoRemoved + " removeu o aviso de " + toRemove.user.username +" , motivo: " + reason)
                        .setTimestamp()
                    toSend.send({embed})
                    message.channel.send({embed})
                    warnedsSave()
                }
        break;
            // VIEW WARN
        case "viewwarn":
            if (checkMod(message)){
                let toView = message.mentions.members.first()
                
                if(message.mentions.members.size == 0){
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if(warneds[toView.id]){
                    message.channel.send({embed: warneds[toView.id].embed})
                }
                else message.channel.send("Este membro não tem nenhum aviso")
                
            }
            else if (warneds[message.author.id]){
                message.channel.send({embed: warneds[message.author.id].embed})
                return;
            }
            else message.channel.send("Você não tem nenhum aviso")
        break;
            // MUTE
        case "mute":
            if (checkMod(message)){
                let whoMuted = message.author.username + " #" + message.author.discriminator
                let reason = args.slice(2).join(" ")
                let toMute = message.mentions.members.first()
                
                if (message.mentions.members.size == 0){
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toMute.id){
                    message.channel.send("Você não pode se mutar")
                    return;
                }
                if (!Number(args[1])){
                    message.channel.send("Você precisa especificar um tempo em minutos")
                    return;
                }
                if(args[2] == undefined){
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                if (toMute.id == client.user.id){
                    message.channel.send("Você não pode me mutar")
                    return;
                }

                let time = minsToMilSecs(args[1])

                
                muted.add(toMute.id)
                setTimeout(()=>{
                    muted.delete(toMute.id)
                },time)

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                let embed = new Discord.RichEmbed()
                    .setTitle("Mute")
                    .setColor(hexAmarelo)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toMute.user.avatarURL)
                    .setDescription(whoMuted + " mutou " + toMute.user.username +" por " + args[1] + " minutos, motivo: " + reason)
                    .addField("Para desmutar o mesmo, utilize o " + config.prefix + "unmute", "@" + toMute.user.username)
                    .setTimestamp()
                toSend.send({embed})
                message.channel.send({embed})

            }
        break;
            // UNMUTE
        case "unmute":
            if (checkMod(message)){
                

                let whoUnMuted = message.author.username + " #" + message.author.discriminator
                let toUnMute = message.mentions.members.first()
                let reason = args.slice(1).join(" ")
                if (message.mentions.members.size == 0){
                    message.channel.send("Você precisa mencionar o membro")
                    return;
                }
                if (!muted.has(toUnMute.id)){
                    message.channel.send("O membro informado não consta na lista de mute")
                    return;
                }
                if (args[1] == undefined){
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                muted.delete(toUnMute.id)
                
                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                let embed = new Discord.RichEmbed()
                    .setTitle("Unmute")
                    .setColor(hexVerde)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toUnMute.user.avatarURL)
                    .setDescription(whoUnMuted + " desmutou " + toUnMute)
                    .setTimestamp()
                toSend.send({embed})
                message.channel.send({embed})
            }
        break;
            // KICK
        case "kick":
            if (checkMod(message)){
                let whoKicked = message.author.username + " #" + message.author.discriminator
                if(args[1] == undefined){
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                let reason = args.slice(1).join(" ")
                
                let toKick = message.mentions.members.first()
                if (message.mentions.members.size == 0){
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toKick.id){
                    message.channel.send("Você não pode se kickar")
                    return;
                }
                if (toKick.id == client.user.id){
                    message.channel.send("Você não pode me kickar")
                    return;
                }
                kick()
                async function kick(){
                    await toKick.user.send("Você foi kickado da FX Masters pelo seguinte motivo: " + reason + " " + config.invite)
                    await toKick.user.send("Para fazer um apelo, digite " + config.prefix + "appeal em nosso server de apelos: https://discord.gg/ZaMyX8A")
                    await toKick.user.send("A equipe da FX Masters")
                    toKick.kick(whoKicked + " o kickou pelo seguinte motivo: " + reason)
                }

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                let embed = new Discord.RichEmbed()
                    .setTitle("Kick")
                    .setColor(hexLaranja)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toKick.user.avatarURL)
                    .setDescription(whoKicked + " kickou " + toKick.user.username +", motivo: " + reason)
                    .setTimestamp()
                    .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                toSend.send({embed})
                message.channel.send({embed})
            }
        break
            // BAN
        case "ban":
            if (checkAdmin(message)){
                
                let whoBanned = message.author.username + " #" + message.author.discriminator
                var isNumeric = function (n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                if(!Number(args[1])){
                    message.channel.send("Você precisa especificar um tempo em dias")
                    return;
                }
                if(args[2] == undefined){
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                let reason = args.slice(2).join(" ")
                
                let toBan = message.mentions.members.first()
                if (message.mentions.members.size == 0){
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toBan.id){
                    message.channel.send("Você não pode se banir")
                    return;
                }
                if (toBan.id == client.user.id){
                    message.channel.send("Você não pode me banir")
                    return;
                }
                banned[toBan.user.username.toLowerCase()] = toBan.id
                bannedSave()
                
                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                ban()
                async function ban(){
                    await toBan.user.send("Você foi banido da FX Masters pelo seguinte motivo: " + reason)
                    await toBan.user.send("Para fazer um apelo, digite " + config.prefix + "appeal em nosso server de apelos: https://discord.gg/ZaMyX8A")
                    await awaittoBan.user.send("A equipe da FX Masters")
                    toBan.ban({days: args[1], reason: whoBanned + " o baniu por " + args[1] + "dias, motivo: " + reason + " ||| Database: " + toBan.user.username + " : " + toBan.id})
                }
                let embed = new Discord.RichEmbed()
                    .setTitle("Ban")
                    .setColor(hexVermelho)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toBan.user.avatarURL)
                    .setDescription(whoBanned + " baniu " + toBan.user.username +" por " + args[1] + " dias, motivo: " + reason)
                    .addField("Para desbanir o mesmo, utilize o " + config.prefix + "unban", toBan.user.username + " : " + toBan.id)
                    .setTimestamp()
                    .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                toSend.send({embed})
                message.channel.send({embed})

            }
        break
            // UNBAN
        case "unban":
            if (checkAdmin(message)){
                var whoUnBanned = message.author.username + " #" + message.author.discriminator
                var toUnban = args.join(" ")
                
                if(banned[toUnban] == undefined){
                    message.channel.send("Não foi possível desbanir o membro pois ele não existe ou não pode ser encontrado no banco de dados. Utilize o comando " + config.prefix + "unbanId para desbanir via id")
                }
                client.fetchUser(banned[toUnban]).then(user =>{
                    
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                    let embed = new Discord.RichEmbed()
                        .setTitle("Unban")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(user.avatarURL)
                        .setDescription(whoUnBanned + " desbaniu " + unbanned)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    delete banned[toUnban]
                    toSend.send({embed})
                    message.channel.send({embed})
                })

            }
        break;
            // UNBANID
        case "unbanid":
            if(checkAdmin(message)){
                var whoUnBanned = message.author.username + " #" + message.author.discriminator
                let toUnban = args.join(" ")

                var userIdExists = true
                client.fetchUser(toUnban, userIdExists).then(user =>{
                    
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                    let embed = new Discord.RichEmbed()
                        .setTitle("Unban")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(user.avatarURL)
                        .setDescription(whoUnBanned + " desbaniu " + unbanned)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    delete banned[toUnban]
                    toSend.send({embed})
                    message.channel.send({embed})
                    
                })
                console.log(userIdExists)
                if(!userIdExists){
                    message.channel.send("O membro não existe")
                }
            }
        break;
            // APPEAL
        case "appeal":
            if (banned[message.author.username]){
                let apeal = args.join(" ")
                if (args[0] == undefined){
                    message.channel.send("Você precisa fornecer uma detalhada descrição do seu apelo")
                    return;
                }

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                let embed = new Discord.RichEmbed()
                        .setTitle("Pedido de apelo")
                        .setColor(hexVermelho)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(message.author.avatarURL)
                        .setDescription("Um pedido de apelo está sendo feito por " + message.author.username + " #" + message.author.discriminator)
                        .addField("Ele(a) acredita que foi banido por:", apeal)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    toSend.send({embed})
                    message.channel.send({embed})


            }
            else {
                let apeal = args.join(" ")
                if (args[0] == undefined){
                    message.channel.send("Você precisa fornecer uma detalhada descrição do seu apelo")
                    return;
                }

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
                let embed = new Discord.RichEmbed()
                        .setTitle("Pedido de apelo")
                        .setColor(hexLaranja)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(message.author.avatarURL)
                        .setDescription("Um pedido de apelo está sendo feito por " + message.author.username + " #" + message.author.discriminator)
                        .addField("Ele(a) acredita que foi expulso por:", apeal)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    toSend.send({embed})
                    message.channel.send({embed})
            }
        break;

            // ===========================================
        default :
            message.channel.send(randomMessage())
        break;
    }



});

client.on("error", (e) => {
    console.error(e)
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    let embed = new Discord.RichEmbed()
        .setTimestamp()
        .setColor(hexVermelho)
        .setTitle("Erro detectado")
        .setDescription(e)
    toSend.send()
});
client.on("warn", (e) => {
    console.warn(e)
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    let embed = new Discord.RichEmbed()
        .setTimestamp()
        .setColor(hexAmarelo)
        .setTitle("Aviso detectado")
        .setDescription(e)
    toSend.send()
});

client.login(config.token)