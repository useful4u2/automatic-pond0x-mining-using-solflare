(async function automate () {
    /***********************************
     * Pond0x optimizer v1.0
     * How to Use:
     * 
     * 1. Modify script settings at the end of this file
     * 2. Change phantom wallet lock time to 8 hours
     * 3. Go to https://www.pond0x.com
     * 4. Wait until website is fully loaded
     * 5. Press your F12 keyboard key to show dev tools
     * 6. Copy and paste this javascript code in your in browser console
     * 7. When Phantom dialog appear, confirm signing
     * 8. Close dev tools by press your F12 keyboard key again
     * 9. Enjoy your fully automatic miner rig ;-)
     * 
     * All informations about Pond0x:
     * - X: @Pond0x | Founders: @Pauly0x & @hwonderWorld
     * Websites:
     * - Pond0x   - https://www.pond0x.com
     * - PondCoin - https://www.pondcoin.com
     * - Linktree - https://linktr.ee/pond0x
     * Coins:
     * - $PNDC (Ethereum)  : 0x423f4e6138e475d85cf7ea071ac92097ed631eea
     * - $wPOND (Solana)   : 3JgFwoYV74f6LwWjQWnr3YDPFnmBdwQfNyubv99jqUoq
     * - $PORK: (Ethereum) : 0xb9f599ce614Feb2e1BBe58F180F370D05b39344E
     */

    // Get current time in unix format
    const getTime = function () {
        return Math.floor(new Date().getTime() / 1000)
    }
    const getCurrentStringDate = function () {
        var m = new Date();
        // Formatage avec zéro à gauche pour les mois, jours, heures, minutes et secondes
        const year = m.getFullYear(); // Année locale
        const month = (m.getMonth() + 1).toString().padStart(2, '0'); // Mois local, avec zéro à gauche
        const day = m.getDate().toString().padStart(2, '0'); // Jour local, avec zéro à gauche
        const hours = m.getHours().toString().padStart(2, '0'); // Heures locales, avec zéro à gauche
        const minutes = m.getMinutes().toString().padStart(2, '0'); // Minutes locales, avec zéro à gauche
        const seconds = m.getSeconds().toString().padStart(2, '0'); // Secondes locales, avec zéro à gauche
        // Retourner la date formatée en heure locale
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }
    let totalAmount = 0;
    let totalSessionsDuration = 0;
    let startExecution = getCurrentStringDate();
    // Fonction pour convertir un montant en chaîne (par exemple '134.5m' ou '1.68b') en nombre
    function parseAmount(amountStr) {
        const regex = /^(\d+(\.\d+)?)\s*(m|b)$/i;
        const match = amountStr.match(regex);
        
        if (!match) {
            throw new Error('Format de montant invalide');
        }
        
        const value = parseFloat(match[1]);
        const suffix = match[3].toLowerCase();
        
        // Conversion selon le suffixe
        if (suffix === 'm') {
            return value * 1_000_000; // Multiplie par 1 million
        } else if (suffix === 'b') {
            return value * 1_000_000_000; // Multiplie par 1 milliard
        }
        
        return 0;
    }
    // Fonction pour ajouter un montant à la variable globale 'totalAmount'
    function addToTotal(amountStr) {
        const parsedAmount = parseAmount(amountStr);
        totalAmount += parsedAmount;
    }
    // Fonction pour formater le montant total sous le format désiré (par exemple "134.5m" ou "1.68b")
    function formatAmount(amount) {
        if (amount >= 1_000_000_000) {
            return (amount / 1_000_000_000).toFixed(2) + 'b'; // Si c'est un milliard
        } else if (amount >= 1_000_000) {
            return (amount / 1_000_000).toFixed(2) + 'm'; // Si c'est un million
        }
        return amount.toFixed(2); // Sinon, format simple
    }
    // Get a dom node from his content text
    const searchNodeByContent = function (selector, text) {
        const nodes = document.querySelectorAll(selector)
        for (n=0; n<nodes.length; n++) {
            const node = nodes[n]
            if (node.textContent == text) {
                return node
            }
        }
        return null
    }
    // Extract all mining session params from pond0x lcd widget
    const getLCDParams = function () {
        const params = {}
        const nodeLines = document.querySelectorAll('.lcdbox')
        for (l=0; l<nodeLines.length; l++) {
            const nodeLine = nodeLines[l]
            //console.log('nodeLine', nodeLine)
            const nodeChars = nodeLine.childNodes
            let paramName = ''
            let paramValue = ''
            let nameOk = false
            for (c=0; c<nodeChars.length; c++) {
                const nodeChar = nodeChars[c]
                let content = nodeChar.textContent || ''
                //console.log('content', content)
                content = content.toLowerCase()
                if (!nameOk) {
                    if (content == ':') {
                        nameOk = true
                        continue
                    }
                    if (content && content != ' ') {
                        paramName += content
                    }
                }
                else if (content && content != ' ') {
                    paramValue += content
                }
            }
            if (nameOk) {
                params[paramName] = paramValue
            }
        }
        return params
    }
    // Get signin signature key from phantom wallet 
    const getSignature = async function () {

        const result = await phantom.solana.signMessage(
            new Buffer('Securely connect xMiner to network'),
            'utf8'
        )
        window.pond0xO.signature = result.signature
        window.pond0xO.publicKey = result.publicKey

        const signatureText = new TextDecoder().decode(result.signature)
        const publicKeyText = result.publicKey.toString()

        //console.log(`${lh} ${getCurrentStringDate()} - signature: ${signatureText}`)
        console.log(`${lh} ${getCurrentStringDate()} - publicKey: ${publicKeyText}`)
    }
    // Hijack phantom wallet to avoid confirm dialog ;-)
    const hijackPhantom = function () {
        window.phantom.solana.signMessage = async (t, n="utf8") => {
            return Promise.resolve({
                signature: pond0xO.signature,
                publicKey: pond0xO.publicKey
            })
        }
    }
    // Get time in milliseconds
    const getTimeMS = function (seconds) {
        return seconds * 1000
    }
    // Reload page silently whitout refresh
    // to keep this script injected 
    const reloadMining = function (back) {
        pond0xO.startTime = getTime()
        if (back) {
            window.history.back()
        }
        setTimeout(function () {
                const mineBtn = searchNodeByContent('p','Mine')
                console.log(`${lh} ${getCurrentStringDate()} - launching mining page...`)
                mineBtn.click()
            },
            getTimeMS(pond0xO.reloadInterval)
        )
    }
    // Main function running session
    const run = function () {
        const runTime = getTime()

        const mineBtn = searchNodeByContent('button','Mine')
        const stopBtn = searchNodeByContent('button','STOP ANYWAYS')
        const claimBtn = searchNodeByContent('button','STOP & Claim')
        const joiningBtn = searchNodeByContent('button','JOINING')

        const mineParams = getLCDParams()
        //if (Object.keys(mineParams).length > 0) {
        //    console.log(`${lh} - mineParams`, JSON.stringify(mineParams))
        //}
        const mineTimedOut = runTime > pond0xO.startTime + pond0xO.noClaimMaxTime
        const notWellStartedCheck = runTime > pond0xO.startTime + pond0xO.wellLaunchTime
        const inactiveMinerCheck = runTime > pond0xO.startTime + pond0xO.inactiveMiningTime
        const stuckInJoiningCheck = runTime > pond0xO.startTime + pond0xO.stuckInJoiningTime
        const currentSessionDuration = runTime - pond0xO.startTime

        if (mineBtn) {
            console.log(`${lh} ${getCurrentStringDate()} - start mining...`)
            mineBtn.click()
        }
        else if (stopBtn) {
            if (mineTimedOut) {
                console.log(`${lh} ${getCurrentStringDate()} - only ${mineParams.unclaimed} accumulated after ${pond0xO.noClaimMaxTime/60} mins.`)
                console.log(`${lh} ${getCurrentStringDate()} - stop mining...`)
                stopBtn.click()
                console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                reloadMining(true)
            }
            else if (inactiveMinerCheck) {
                if (mineParams.unclaimed == '1.6m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1.6m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }
            }
            else if (notWellStartedCheck) {
                if (mineParams.unclaimed == '1.1m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1.1m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }else if (mineParams.unclaimed == '1m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }else if (mineParams.unclaimed == '100k') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 100k.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }
            }
        }
        else if (claimBtn) {
            if (mineParams.hashrate == '0.00h/s') {
                addToTotal(mineParams.unclaimed)
                totalSessionsDuration = totalSessionsDuration + currentSessionDuration
                console.log(`${lh} ${getCurrentStringDate()} - claiming ${mineParams.unclaimed} tokens, session duration ${currentSessionDuration/60} mins.`)
                console.log(`${lh} ${getCurrentStringDate()} - total mined ${formatAmount(totalAmount)}, total sessions durations ${totalSessionsDuration/360} hrs ${(totalSessionsDuration%360)/60} mins.`)
                claimBtn.click()
                console.log(`${lh} ${getCurrentStringDate()} - waiting ${pond0xO.claimInterval/60} mins.`)
                setTimeout(function () {
                        console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                        reloadMining(true)
                    },
                    getTimeMS(pond0xO.claimInterval)
                )
            }
        } 
        else if (joiningBtn){
            if (stuckInJoiningCheck) {
                console.log(`${lh} ${getCurrentStringDate()} - stuck in joining status.`)
                console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                reloadMining(true)
            }
        }
        else if (!claimBtn && !stopBtn && !mineBtn && !joiningBtn){
            if (inactiveMinerCheck) {
                if (mineParams.unclaimed == '1.6m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1.6m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }
            }
            else if (notWellStartedCheck) {
                if (mineParams.unclaimed == '1.1m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1.1m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }else if (mineParams.unclaimed == '1m') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 1m.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }else if (mineParams.unclaimed == '100k') {
                    console.log(`${lh} ${getCurrentStringDate()} - unclaimed stuck at 100k.`)
                    console.log(`${lh} ${getCurrentStringDate()} - reloading...`)
                    reloadMining(true)
                }
            }
        }
    }
    const lh = `[automation]`

    // Pond0x optimizer settings
    // Modify for best performance
    window.pond0xO = {
        startTime: 0,
        // Delay in seconds between each run
        runInterval: 5, // each 5 seconds
        // Delay in seconds between each claim
        claimInterval: 120, // 2 minutes
        // Delay in seconds between each page reloading
        // depends of your device performance 
        reloadInterval: 5, // 5 secondes
        // Time in seconds to force reload 
        // while no claim action appearing
        // (stuck at 1.6m, connection error, miner updated...)
        noClaimMaxTime: 2100, // 35 minutes
        wellLaunchTime: 60, // 1 minute --> 1.1M & 100K cases
        inactiveMiningTime: 600, // 10 minutes --> 1.6M inactive miners
        stuckInJoiningTime: 180 // 3 minutes --> Did not join within 3 mins
    }
    console.log(`${lh} ${getCurrentStringDate()} - loading keys...`)
    await getSignature()
    console.log(`${lh} ${getCurrentStringDate()} - settings `, JSON.stringify(pond0xO))
    hijackPhantom()
    console.log(`${lh} ${getCurrentStringDate()} - phantom hijacked.`)

    reloadMining(false)
  
    setInterval(
        run,
        getTimeMS(pond0xO.runInterval)
    )
})()
