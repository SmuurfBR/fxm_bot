const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const request = require("request")
const schedule = require("node-schedule")
const google = require("google")
const shortener = require("tinyurl")
const snekfetch = require("snekfetch")
const { gitCommitPush } = require("git-commit-push-via-github-api")

const gitToken = process.env.GITHUB_TOKEN

var preMessages = require("./Database/mensagens.json")
var config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
var banned = JSON.parse(fs.readFileSync("./Database/banidos.json", "utf8"));
var warneds = JSON.parse(fs.readFileSync("./Database/avisados.json", "utf8"))
var changelog = JSON.parse(fs.readFileSync("./Database/changelog.json", "utf8"))
var profiles = JSON.parse(fs.readFileSync("./Database/profiles.json", "utf8"))
var giveaways = JSON.parse(fs.readFileSync("./Database/sorteios.json", "utf8"))

var appealsBans = []
var appealsKicks = []

var muted = new Set();
var appealList = new Set();
var onChat = new Set();

var giveawayTitle
var giveawayP1 = new Set();
var giveawayP2 = new Set();
var giveawayP3 = new Set();
var giveawayP4 = new Set();
var description = "N/A"
var max = 1000
var min = 0
var days = 7

var warnResponse = ""
var messageContainer
var maintaince = false

let whoWarned
let toWarn
let reason

var messageIds = []
var ytApi = "AIzaSyDgGHSUWhmmDcNuLK_DRwY-HgCUaG6VCOU"

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

async function commit(){
    console.log("Starting GitHub commits\n---------------------------")
    
    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/sorteios.json", content: fs.readFileSync("./Database/sorteios.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic giveawaysSave() JSON commit"
    }).then(res =>{
        console.log("Giveaways saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/banidos.json", content: fs.readFileSync("./Database/banidos.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic bannedSave() JSON commit"
    }).then(res =>{
        console.log("Bans saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/avisados.json", content: fs.readFileSync("./Database/avisados.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic warndsSave() JSON commit"
    }).then(res =>{
        console.log("Warns saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/changelog.json", content: fs.readFileSync("./Database/changelog.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic changelogSave() JSON commit"
    }).then(res =>{
        console.log("Changelog saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/profiles.json", content: fs.readFileSync("./Database/profiles.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic profileSave() JSON commit"
    }).then(res =>{
        console.log("Profiles saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })
    console.log("Finished GitHub commits")
}

function giveawaysSave(){
    fs.writeFile("./Database/sorteios.json", JSON.stringify(giveaways), (err) => {
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

function profileSave(){
    fs.writeFile("./Database/profiles.json", JSON.stringify(profiles), (err) => {
        if (err) console.error(err)
    });
    
}
function checkAdmin(message,send){
    if (send == null || undefined) send = true
    if (message.member.roles.some(r => ["Dono", "Admin"].includes(r.name))){
        return true
    }
    else if (message.member.roles.some(r => ["Moderadores"].includes(r.name))) randomMessage("", "lowPerms")
    else {
        if(!send) return false
        message.channel.send(randomMessage("" , "perms"))
        return false
    }
}
function checkMod(message,send){
    if (send == null || undefined) send = true
    if (message.member.roles.some(r => ["Dono", "Moderadores", "Admin"].includes(r.name))){
        return true
    }
    else {
        if(!send) return false
        message.channel.send(randomMessage("" , "perms"))
        return false
    }
}
function yearsToMilSecs(years){
    return monthsToMilSecs(years*12)
}
function monthsToMilSecs(months){
    return weeksToMilSecs(months * 4 + 2)
}
function weeksToMilSecs(weeks){
    return daysToMilSecs(weeks*7)
}
function daysToMilSecs(days){
    return hoursToMilSecs(days*24)
}
function hoursToMilSecs(hours){
    return minsToMilSecs(hours*60)
}
function minsToMilSecs(mins){
    return secsToMilSecs(mins*60)
}
function secsToMilSecs(secs){
    return secs*1000
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
        .addField("Para remover o aviso, utilize " + config.prefix + "removewarn","@" + toWarn.user.username)
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

function createProfile(url, id, message){
    request({
        url: url,
        json: true
    }, function(error,response,body){
        if (!error && response.statusCode === 200) {
            function descLess(desc){
                if(desc.length > 200){
                    let newDesc = desc.slice(0,200) +"..."
                    return newDesc
                }
                else return desc
            }
            let items = body.items[0]
            let embed = new Discord.RichEmbed()
                .setAuthor("Perfil do Youtube", "https://goo.gl/pnp1Dn")
                .setColor(hexVermelho)
                .setThumbnail(items.snippet.thumbnails.default.url)
                .setTitle(items.snippet.title)
                .setDescription(items.statistics.subscriberCount + " inscritos, " + items.statistics.videoCount + " vídeos publicados e " + items.statistics.viewCount + " visualizações")
                .addField("Descrição", descLess(items.snippet.description))
                .addField("Link do canal", "https://www.youtube.com/channel/" + id)
                .setFooter("Canal criado em: ")
                .setTimestamp(items.snippet.publishedAt)
            profiles[message.author.id] = {
                channelId: id,
                embed: embed
            }
            profileSave()
            message.channel.send("Perfil criado com sucesso!")
            message.channel.send({embed})
        }
    })

}
function updateProfile(id){
    console.log("Updating profile: " + id)
    let url = "https://www.googleapis.com/youtube/v3/channels?part=snippet%2C%20contentDetails%2C%20brandingSettings%2C%20invideoPromotion%2C%20statistics%2C%20topicDetails&id=" + profiles[id].channelId + "&key=" + ytApi
    request({
        url: url,
        json: true
    }, function(error,response,body){
        if (!error && response.statusCode === 200) {
            function descLess(desc){
                if(desc.length > 200){
                    let newDesc = desc.slice(0,200) +"..."
                    return newDesc
                }
                else return desc
            }
            let items = body.items[0]
            let embed = new Discord.RichEmbed()
                .setAuthor("Perfil do Youtube", "https://goo.gl/pnp1Dn")
                .setColor(hexVermelho)
                .setThumbnail(items.snippet.thumbnails.default.url)
                .setTitle(items.snippet.title)
                .setDescription(items.statistics.subscriberCount + " inscritos, " + items.statistics.videoCount + " vídeos publicados e " + items.statistics.viewCount + " visualizações")
                .addField("Descrição", descLess(items.snippet.description))
                .addField("Link do canal", "https://www.youtube.com/channel/" + profiles[id].channelId)
                .setFooter("Canal criado em: ")
                .setTimestamp(items.snippet.publishedAt)
            profiles[id].embed = embed
            profileSave()
            console.log("Profile saved")
        }
    })
}

var actualDate = new Date()
Object.keys(giveaways).forEach(give =>{
    if (giveaways[give].date == actualDate){
        if(giveaways[give].min > giveaways[give].members){
            var channelId = giveaways[give].channel
            client.guilds.find("name", "FXM").channelId.fetchMessage(giveaways[give].message, (message) =>{
                var giveawayMessage = message
                var giveawayAuthor = message.author
                giveawayAuthor.send("O seu sorteio não foi realizado por não ter alcançado o mínimo de participantes necessários")
                giveawayMessage.delete()
                delete giveaways[give]
                giveawaysSave()
            })
        } else {
            client.guilds.find("name", "FXM").channelId.fetchMessage(giveaways[give].message, (message) =>{
                var winnerId = giveaways[give].membersId[Math.floor(Math.random() * giveaways[give].members)]
                client.fetchUser(winnerId).then(winner =>{
                    message.channels.find("name", "anuncios").send("O ganhador do sorteio " + giveaways[give].title + "foi o " + "<@" + winner.id + ">, Parabéns!\nPara resgatar o seu prêmio, fale com o <@" + giveaways + ">")
                    message.author.send("O ganhador do sorteio foi " + "<@" + winner.id + ">")
                    message.delete()
                    delete giveaways[give]
                    giveawaysSave()
            })
            
            })
            }
            
            
        }
        
    }
)

// ==================================================================================================

// ==================================================================================================
client.on("messageReactionAdd", (reaction, user) =>{
    if (user.bot) return;
    if (user.id == warnResponse){
        if (reaction.emoji.name == "👍"){
            warn(messageContainer)
            warnResponse = ""
            messageContainer.channel.bulkDelete(messageIds)
            messageContainer.channel.send("Aviso criado")
            return;
        }
        if (reaction.emoji.name == "👎"){
            warnResponse = ""
            messageContainer.channel.bulkDelete(messageIds)
            messageContainer.channel.send("Aviso cancelado")
            return;
        }
    }
    if (reaction.emoji.id == "381471384527699968"){
        var exists = false
        var authorId
        Object.keys(giveaways).forEach(key =>{
            if (reaction.message.content.includes(giveaways[key].author)){
                exists = true
                authorId = giveaways[key].author
            }
        })
        
        console.log(authorId)
        
        if(giveaways[authorId].max == giveaways[authorId].members){
            reaction.message.channel.send("Este sorteio atingiu o máximo de membros permitidos").then(msg =>{
                setTimeout(() =>{
                    reaction.message.clearReactions()
                    msg.delete()
                }, secsToMilSecs(10))
                
            })
            return;
        }
        Object.keys(giveaways[authorId].membersId).forEach(member =>{
            if (user.id == member){
                reaction.message.channel.send("Você já está participando deste sorteio").then(msg =>{
                    setTimeout(() =>{
                        msg.delete()
                    }, secsToMilSecs(10))
                    
                })
                return;
            }
        })
        var giveUserId = user.id
        giveaways[authorId].membersId[giveUserId] = giveUserId
        giveaways[authorId].members++
        giveawaysSave()
        reaction.message.edit(giveaways[authorId].author + " | Participantes: "+ giveaways[authorId].members, {embed: giveaways[authorId].embed})
        
        
    }
})
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
// ==================================================================================================

// ==================================================================================================
client.on("message", (message) =>{  
    
    
    var args = message.content.split(" ");
// Sem prefixo abaixo
    if(muted.has(message.author.id)){
        message.delete()
        return;

    }
// com prefixo abaixo
    if(message.author.bot) return;


    if(message.channel.name == "d1f" && !message.content.includes("http")){
        message.delete()
        message.reply("Você precisa enviar um link válido").then(msg =>{
            setInterval(function(){
                msg.delete()
            }, secsToMilSecs(10))
            return
        })
    }
    if(message.channel.name == "d1f" && message.content.includes("http")){
        message.reply("A sua intro foi adicionada à fila").then(msg =>{
            var intro = message.author.username + " | " + message.content
            fs.writeFile("./D1F/" + message.author.username + ".txt", intro, (err) =>{        
                if (err) throw err
            })
            setInterval(function(){
                msg.delete()
            },secsToMilSecs(10))
        })
    }



    

    if(message.guild.name == "FXM"){
        if(message.channel.name !== "bot_commands" && !checkAdmin(message,false)) return
    }
    
    


// ==================================================================================================

// ==================================================================================================
    if(onChat.has(message.author.id)){
        if (message.content == ".chat"){
            message.reply("Você foi removido do ChatBot")
            onChat.delete(message.author.id)
            return;
        }
        var entry
        if (message.content == "") entry = "ahfeahfea" 
        entry = encodeURIComponent(message.content)
        var url = "https://api.dialogflow.com/v1/query?v=20170712&query=" + entry + "&lang=pt-br&sessionId=f5afe3ab-6def-4d78-b412-39236534fe7c&timezone=America/Sao_Paulo"
        snekfetch.get(
            url , { headers: { 'Authorization': 'Bearer 53f6b34b22634536afbc2d01c3cc6e44' } })
            .then(r => {
                message.channel.send(r.body.result.fulfillment.speech)
                if(r.body.result.fulfillment.speech == "Não entendi, mas sua mensagem foi salva para que possa ser usada no meu treinamento"){
                    entry = decodeURIComponent(entry)
                    fs.writeFile("./ChatTraining/" + message.createdTimestamp + ".txt", entry, (err) =>{
                        
                        if (err) throw err
                    })
                }
        })  
        return;  
    }
// ==================================================================================================

// ==================================================================================================
if (giveawayP1.has(message.author.id)){        
        if(args[0] == "cancel"){
            giveawayP1.delete(message.author.id)
            message.channel.send("Sorteio cancelado")
            return;
        }
        description = message.content
        console.log(description)
        message.channel.send("`" + description + "`." +" Agora, digite o número mínimo de participantes do sorteio (o padrão é 1). Caso o número não seja atingido até a data do sorteio, o mesmo será anulado. Você pode digitar cancel para cancelar")
        giveawayP2.add(message.author.id)
        giveawayP1.delete(message.author.id)
        return;
    }

if(giveawayP2.has(message.author.id)){
    if(args[0] == "cancel"){
        giveawayP2.delete(message.author.id)
        message.channel.send("Sorteio cancelado")
        return;
    }
    if(!Number(args[0])) min = 1
    else min = Number(args[0])
    console.log(min)
    message.channel.send("`" + min + "`." + " Agora, defina o número máximo de participantes do sorteio (o padrão é 1000). Caso o número seja atingido, nínguem mais poderá se juntar ao sorteio. Você pode digitar cancel para cancelar")
    giveawayP3.add(message.author.id)
    giveawayP2.delete(message.author.id)
    return; 
}

if(giveawayP3.has(message.author.id)){  
    if(args[0] == "cancel"){
        giveawayP3.delete(message.author.id)
        message.channel.send("Sorteio cancelado")
        return;
    }        
    if(!Number(args[0])) max = 1000
    else max = Number(args[0])
    console.log(max)
    message.channel.send("`" + max + "`. " + "Por último, agora defina o número de dias em que o sorteio deve ser realizado (o padrão é 7 dias). Você pode digitar cancel para cancelar")
    giveawayP4.add(message.author.id)
    giveawayP3.delete(message.author.id)
    return;
} 

if(giveawayP4.has(message.author.id)){
    if(args[0] == "cancel"){
        giveawayP4.delete(message.author.id)
        message.channel.send("Sorteio cancelado")
        return;
    }
    if(!Number(args[0])) days = 7
    else days = Number(args[0])
    generateGiveawayEmbed(giveawayTitle,description,min,max,days,message)
    giveawayP4.delete(message.author.id)
    return;
} 
function generateGiveawayEmbed(title,description,min,max,days,msg){
    var giveawayDate = new Date().setDate(addDays(new Date(), days))
    giveawayDate = new Date(giveawayDate).toISOString()
    function addDays(date,d){
        var result = new Date(date);
        result = (result.getDate() + d);
        return result
    }
    
    let embed = new Discord.RichEmbed()
        .setAuthor("Sorteio realizado por: " + msg.author.username, msg.author.avatarURL)
        .setColor(hexVerde)
        .setTitle(title)
        .setDescription(description)
        .addField("Número mínimo de participantes |", min,true)
        .addField(" Número máximo de participantes", max,true)
        .setFooter("O sorteio será realizado em:")
        .setTimestamp(giveawayDate)
    giveaways[msg.author.id] = {
        title : title,
        desc : description,
        min : min,
        max : max,
        days : days,
        embed : embed,
        members : 0,
        membersId : {},
        date : giveawayDate,
        message : msg.id,
        channel : msg.channel.id,
        author : msg.author.id
    }

    save()
    async function save(){
        await giveawaysSave()
        await msg.channel.send({embed: embed})
        await msg.guild.channels.find("name", "anuncios").send(msg.author.id + " | Participantes: " + "0",{embed: embed}).then(emb => {
            emb.react(client.emojis.get("381471384527699968"))
            console.log(msg.author.id)
        })
    }
    
    
}
// ==================================================================================================
    if(!message.content.startsWith(config.prefix)) return;
    var command = args[0]
    command = command.slice(config.prefix.length);
    args.shift()
    
    
// ==================================================================================================

// ==================================================================================================

    if(maintaince) {
        if(message.content.startsWith(config.prefix + "maintance")){
            maintaince = false
            message.channel.send("Modo manutenção desativado")
            client.user.setStatus("online")
            client.user.setPresence({game:{name: config.prefix + "help", type: 0}});
            return;
        }
        else return;
    }

    
    switch (command){
// Com prefixo abaixo
            // ======================================================================================
            // COMANDOS
            // ======================================================================================
        case "chat":
        case "conversa":
                message.reply("Você foi adicionado ao ChatBot, para sair digite `" + config.prefix + "chat` novamente")
                onChat.add(message.author.id)
                return;  
        break;
        case "short":
        case "shortener":
        case "shorter":
        case "encurtar":
        case "encurtardor":
            if(args[0] == undefined){
                message.channel.send("Você precisa especificar uma URL a ser encurtada")
                return;
            }
            shortener.shorten(args[0], res =>{
                request(res, (err,response,body)=>{
                    if (!err) message.channel.send("URL encurtada: " + res)
                    else message.channel.send("Não foi possível encurtar a URL")
                })
               
                
            })
        break;
        case "google":
        case "search":
        case "s":
        case "g":
        case "pesquisa":
        case "pesquisar":
            var maxResults
            var pesquisa
            if (args[0] == undefined){
                message.channel.send("Você precisa especificar um termo de busca")
                return;
            }
            else if (Number(args[0] && Number(args[0]) < 10)){
                maxResults = args[0]
                pesquisa = args.slice(1).join(" ")
            }
            else {
                maxResults = 1
                pesquisa = args.join(" ")
            }
            google(pesquisa, (err,res) =>{
                if (err) console.log(err)
                if (maxResults == 1){
                    var title = res.links[0].title
                    var href = res.links[0].href
                    var searchDescription = res.links[0].description
                    let embed = new Discord.RichEmbed()
                        .setAuthor("Pesquisa do google", "https://goo.gl/UYNh6k")
                        .setTitle(title)
                        .setDescription(searchDescription)
                        .setURL(href)
                        .setFooter("Você pode adquirir mais resultados colocando um número antes do termo pesquisado")
                        .setColor(hexVerde)
                        message.channel.send({embed})
                }
                else {
                    let embed = new Discord.RichEmbed()
                        .setAuthor("Pesquisa do google", "https://goo.gl/UYNh6k")
                        .setTitle("Termo pesquisado: " + pesquisa)
                        .setDescription("Mostrando um total de " + maxResults + " resultados")
                        .setFooter("Você pode adquirir mais resultados colocando um número antes do termo pesquisado")
                        .setColor(hexVerde)
                        for (let i = 0; i < maxResults; i++){
                            embed.addField(res.links[i].title, res.links[i].href)
                        } 
                        message.channel.send({embed})
                    
                }
            })
        
        break;
        case "youtube":
        case "yt":
        case "video":
        case "y":
            var maxResults
            var pesquisa
            if (args[0]==undefined){
                message.channel.send("Você precisa especificar um termo de busca")
                return;
            }
            else if (Number(args[0]) && Number(args[0]) < 10){
                maxResults = args[0]
                pesquisa = args.slice(1).join(" ")
            }else {
                maxResults = 1
                pesquisa = args.join(" ")
            }
            
            
            var url = "https://www.googleapis.com/youtube/v3/search?part=id%2C%20snippet&maxResults=" + maxResults + "&q=" + pesquisa + "&regionCode=BR&type=video&key="+ ytApi
            request({url: url, json: true}, (err,res,body)=>{
                if (err || res.statusCode !== 200) return;
                var embed = new Discord.RichEmbed()
                    .setAuthor("Pesquisa do YouTube", "https://goo.gl/pnp1Dn")
                    .setTitle("Termo pesquisado: " + pesquisa)
                    .setDescription("Mostrando um total de " + maxResults + " resultados")
                    .setColor(hexVermelho)
                    .setFooter("Você pode adquirir mais resultados colocando um número antes do termo pesquisado")
                    if (maxResults == 1) embed.setThumbnail(body.items[0].snippet.thumbnails.high.url)
                    for(var i = 0; i < maxResults; i++){
                        embed.addField(body.items[i].snippet.title + " | " + body.items[i].snippet.channelTitle,"http://youtu.be/" + body.items[i].id.videoId)
                    }
                    message.channel.send({embed})
                    
            })
        break;
        case "profile":
        case "perfil":
            if(message.mentions.members.size == 0){
                message.channel.send({embed: profiles[message.author.id]})
                return;
            }
            let id = message.mentions.members.first().id
            if(!profiles[id]){
                message.channel.send("Este membro não tem um perfil criado")
                return;
            }
            message.channel.send({embed: profiles[id].embed})
        break;
        case "setprofile":
        case "setarperfil":
        case "setperfil":
        case "setarprofile":
            if(args[0] == undefined){
                message.channel.send("Você precisa especificar o ID do seu canal http://prntscr.com/ift8b1")
                return
            }
            var channelId = args[0]
            var url = "https://www.googleapis.com/youtube/v3/channels?part=snippet%2C%20contentDetails%2C%20brandingSettings%2C%20invideoPromotion%2C%20statistics%2C%20topicDetails&id=" + channelId + "&key=" + ytApi
            createProfile(url, channelId, message)
            

        break;
        case "ping":
            let ping = message.createdTimestamp - new Date().getTime()
            message.channel.send("Seu ping: " + Math.floor(client.ping) + " ms")
        break;
            //random    
        case "random":
        case "aleatorio":
        case "randomico":
        case "aleatório":
        case "randômico":
            if (args[0] == undefined){
                message.channel.send("Você precisa informar um valor máximo")
                return;
            }
            if (!Number(args[0])){
                message.channel.send("Você precisa informar um valor numérico")
                return;
            }
            if(args[1] == undefined){
                let random = Math.floor(Math.random() * args[0])
                message.channel.send("O valor resultante foi: " + random)
            } 
            else{
                if (!Number(args[1])){
                    message.channel.send("Você precisa informar um valor numérico")
                    return;
                }
                if (Number(args[1]) <= Number(args[0])){
                    message.channel.send("O valor máximo não pode ser menor ou igual ao valor mínimo")
                    return;
                }
                let random = Math.floor(Math.random() * (args[1]) - (args[0]))
                random = random + Number(args[0])
                message.channel.send("O valor resultante foi: " + random)
            }
        break;
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
        case "convite":
        case "convidar":
            message.channel.send("Aqui está: " + config.invite + " c:")
        break;

            // ======================================================================================
            // EMBEDS
            // ======================================================================================
        case "info":
            let embed = new Discord.RichEmbed()
                .setAuthor(config.author[0] , config.author[1])
                .setColor(hexBranco)
                .setTitle("Versão: " + changelog.versions[0])
                .setDescription(config.developed)
                .addField("Pacotes NPM", config.packages, true)
                .addField("Banco de dados", config.database, true)
                .setThumbnail(config.botImg)
                .setFooter("Versão compilada")
                .setTimestamp(changelog[changelog.versions[0]].timestamp)
            message.channel.send({embed})
                
        break;
        case "help":
        case "ajuda":
            if (args[0] !== undefined){
                let cmdHelp = args[0]
                if (!config.help[cmdHelp]){
                    message.channel.send("O comando não existe")
                    return;
                }
                message.channel.send("`" + config.prefix + args[0] + config.help[cmdHelp].moreInfo)
                return;
            }
            else{
                    let messageToSend = "**Todos os comandos estão listados abaixo** \nPara adquirir mais informações, digite " + config.prefix + "help e o comando \n \n"
                
                var help = config.help.commands.forEach(c =>{
                    messageToSend = messageToSend + "`" + c + "`: " + config.help[c].info + "\n"
                    
                })
                message.channel.send(messageToSend)
        }
            
        break;

        case "helpadm":
        case "ajudaadm":
            if (args[0] !== undefined){
                let cmdHelp = args[0]
                if (!config.helpAdm[cmdHelp]){
                    message.channel.send("O comando não existe")
                    return;
                }
                message.channel.send("`" + config.prefix + args[0] + config.helpAdm[cmdHelp].moreInfo)
                return;
            }
            else{
                    let messageToSend = "**Todos os comandos estão listados abaixo** \nPara adquirir mais informações, digite " + config.prefix + "help e o comando \n \n"
                
                var help = config.helpAdm.commands.forEach(c =>{
                    messageToSend = messageToSend + "`" + c + "`: " + config.helpAdm[c].info + "\n"
                    
                })
                message.channel.send(messageToSend)}
        break;
        
        case "changelog":
        case "alterações":
        case "alteracoes":
        case "alteraçoes":
        case "alteracões":
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
                        let dividedDesc = fullDesc.split("><")
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
                                long: dividedDesc[1],
                                timestamp: new Date()
                            }
                            changelog.versions.unshift(version)
                            changelogSave()
                            let toSend = message.guild.channels.find("name", "anuncios")
                            let embed = new Discord.RichEmbed()
                                .setAuthor(message.author.username, message.author.avatarURL)
                                .setColor(hexVerde)
                                .setTitle("Versão: "+version)
                                .addField(dividedDesc[0],dividedDesc[1])
                                .setTimestamp()
                            toSend.send("Uma nova versão do bot ficou disponível:")
                            toSend.send({embed})
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
        case "giveaway":
        case "give":
        case "sorteio":
        case "sortear":
                if(checkAdmin(message)){
                    if(giveaways == message.author.id){
                        if(args[0] == undefined){
                            message.channel.send("Você não pode ter mais de um sorteio em andamento")
                            return;
                        }
                        else if(args[0] == "delete"){
                            delete giveaways[message.author.id]
                        }
                    }
                    if(args[0] == undefined){
                        message.channel.send("Você precisa definir um título para o sorteio")
                        return;
                    }
                    giveawayTitle = args.join(" ")
                    message.channel.send("`" + giveawayTitle + "`." + " Determine uma descrição para o sorteio. Você pode digitar cancel para cancelar")
                    
                    giveawayP1.add(message.author.id)

                }
        break;
        case "maintance":
        case "maintaince":
        case "manutenção":
                maintaince = true
                message.channel.send("Ativando o modo manutenção")
                client.user.setPresence({game:{name: "Em manutenção", type: 0}});
                client.user.setStatus("idle")
                return;
        break;
        case "send":
        case "enviar":
            if(checkMod()){
                if(message.mentions.channels.size == 0){
                    message.channel.send("Você precisa mencionar um canal")
                    return;
                }
                let channel = message.mentions.channels.first()
                let index = args.indexOf(channel)
                let messageToSend = args.splice(index,1)
                channel.send(messageToSend)
            }
        break;
            // clean
        case "clean":
        case "clear":
        case "limpar":
        case "apagar":
                if(checkMod(message)){
                    if(!Number(args[0])){
                        message.channel.send("Você precisa especificar a quantidade de mensagens a ser apagadas")
                        return;
                    }
                    if (Number(args[0] > 99)){
                        message.channel.send("Você precisa especificar uma quantidade menor ou igual a 100, desculpa, limitações da API :c")
                        return;
                    }
                    if (message.mentions.members.size == 0) clean()
                    //else cleanAuthor()
                    async function clean(){
                        await message.delete()
                        await message.channel.bulkDelete(Number(args[0]))
                        await message.reply("Apagou " + args[0] + " mensagens deste canal").then(msg =>{
                            setInterval(() =>{
                                msg.delete()
                            }, secsToMilSecs(10))
                        })
                    }
                    /*
                    async function cleanAuthor(){
                        let reason = args.slice(2).join(" ")
                        let memberMessages = []
                        message.channel.fetchMessages().then(messages =>{
                            memberMessages.push(messages.filter(m => m.author.id === message.mentions.members.first().id))

                        })
                        let toDelete = []   
                        for (let i = 0; i < Number(args[0]); i++){
                            toDelete.push(memberMessages[i])
                            console.log("for")
                        }
                        console.log(memberMessages)
                        await message.channel.bulkDelete(toDelete)
                        await message.reply("Apagou " + args[0] + " mensagens de " + message.mentions.members.first().user.username + " deste canal, motivo: " + reason)
                    }
                    */
                }
        break;
            
            // WARN
        case "warn":
        case "aviso":
        case "avisar":
                if(checkMod(message)){
                    messageContainer = message
                    whoWarned = message.author.username + " #" + message.author.discriminator
                    toWarn = message.mentions.members.first()
                    reason = args.slice(1).join(" ")
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
                    

                    if(warneds[toWarn.id]){
                        console.log(message.id)

                        message.channel.send("Este membro já tem um aviso, deseja criar outro aviso? Isso irá sobescrever o existente").then(m => {messageIds.push(m)})
                        message.channel.send({embed: warneds[toWarn.id].embed}).then(m => {
                            react()
                            async function react(){
                                await m.react("👍")
                                await m.react("👎")
                                messageIds.push(m)
                            }
                        })
                        message.channel.send("Você tem 30 segundos para fazer isso").then(m => {messageIds.push(m)})
                        .catch(err => {console.log(err)})
                        warnResponse = message.author.id
                        setTimeout(() =>{
                            warnResponse = ""
                        }, secsToMilSecs(30))
                        return;
                    }
                    warn(messageContainer)
                }
        break;

            // REMOVE WARN
        case "removewarn":
        case "removeraviso":
        case "removerwarn":
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
        case "veraviso":
        case "visualizaraviso":
        case "verwarn":
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
        case "silenciar":
        case "calar":
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
        case "desmutar":
        case "descalar":
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
        case "expulsar":
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
                 
            }
        break
            // BAN
        case "ban":
        case "banir":
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
                    await toBan.user.send("A equipe da FX Masters")
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
        case "desbanir":
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
                    if(appealList.has(user.id)){
                        user.send("Seu apelo foi aceito, você pode se juntar a nós novamente! " + config.invite)
                        appealList.delete(user.id)
                    }
                })

            }
        break;
            // UNBANID
        case "unbanid":
        case "desbanirid":
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
                    if(appealList.has(user.id)){
                        user.send("Seu apelo foi aceito, você pode se juntar a nós novamente! " + config.invite)
                        appealList.delete(user.id)
                    }
                    
                })
                console.log(userIdExists)
                if(!userIdExists){
                    message.channel.send("O membro não existe")
                }
            }
        break;
            // APPEAL
        case "appeal":
        case "apelo":
        case "apelar":
            if (!checkAdmin()){
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
                        toSend.send("Id do apelo: " + message.author.id)
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
                        toSend.send("Id do apelo: " + message.author.id)
                        message.channel.send("Seu pedido foi realizado, aguarde uma providência da nossa equipe.")
                        message.channel.send({embed})
                        appealList.add(message.author.id)

                         
                }
            }
            else {
                if (args[0] == "accept"){

                }
            }
        break;

            // ===========================================
        case "eval":
            function clean(text) {
                if (typeof(text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
            if(message.author.id !== "301505269391687680") return;
            try {
            const code = args.join(" ");
            let evaled = eval(code);
        
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
        
            message.channel.send(clean(evaled), {code:"xl"});
            } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
        break;
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

var a = schedule.scheduleJob('0 0 * * *', function(){
    console.log("Starting updating profiles")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    let ids = Object.keys(profiles).forEach(id =>{
        updateProfile(id)
    })
})
var b = schedule.scheduleJob('0 23 * * *', function(){
    commit()
})

client.login(process.env.BOT_TOKEN)
process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));
