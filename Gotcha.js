const   fs = require('fs')
const   https = require('https');

const   store = {
    opc: 'one-piece',
    bor: 'boruto',
    mha: 'my-hero-academia',
    hxh: 'hunter-x-hunter',
    blc: 'black-clover',
    kgd: 'kingdom',
    drs: 'dr-stone',
    tpn: 'the-promised-neverland',
    anm: 'anima',
    fty: 'fairy-tail-100-years-quest'
}

const   hostname = 'https://scan-france.com/';
const   iso_m = store[process.argv[2]]
const   nth = parseInt(process.argv[3]);
const   scanURL = `${hostname}/${iso_m}/${nth}/`
const   storageMobile = `${process.env.HOME}/storage/dcim/${iso_m}-${nth}` //Termux
const   storagePC = `${process.env.HOME}/${iso_m}-${nth}`

const   storage = (process.argv.indexOf('-m') === 4 || process.argv.indexOf('--mobile') === 4) ? storageMobile : storagePC

const getURIs = (host) => {
    const   rgx_pages = new RegExp('value=\\"(\\?page=([0-9]{1,2}))\\"', 'g');

    return new Promise((resolve, reject) => {
        https.get(host, (res) => {
            let rawData = '';
        
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                rawData += chunk
            });
        
            res.on('end', () => {
                let get_pages = rawData.match(rgx_pages);
                let scansURI = new Array();

                if (get_pages) {

                    get_pages.forEach(page => {
                        let href = page.match(/\b([1-9]|[1-9][0-9])+\b/)
                        scansURI.push(`${hostname}${iso_m}/${nth}/${href[0]}.png`);
                    })
                    resolve(scansURI);

                }
                reject(`Sorry, this chapter is unavailable ...\nnode Gotcha --help`);
            });

            res.on('error', (e) => { reject(e) })
        });
    })
}

const downloadScan = (link, idx) => {
    return new Promise((resolve, reject) => {
        https.get(link, (res) => {
            let rawData = '';

            res.setEncoding('base64')
            res.on('data', (chunk) => {
                rawData += chunk
                process.stdout.write("Downloading " + rawData.length  + " bytes\r");
            });

            res.on('end', () => {
                let n_scan = idx + 1
                n_scan = (n_scan.toString().length === 1) ? '0' + n_scan : n_scan

                fs.writeFile(`${storage}/${n_scan}.png`, rawData, {encoding: 'base64'}, (err) => {
                    if (err) { reject(err) }
                    console.log('[GET]', link, '\t',"\x1b[36m",'DOWNLOADED',"\x1b[0m")
                    resolve('Done')
                })
            });

            res.on('error', (e) => { reject(e) })
        });
    })
}

const Gotcha = () => {
    if (process.argv.indexOf('-h') === 2 || process.argv.indexOf('--help') === 2) {
        console.log('Gotcha is a simple tool that scraps chapters from scan-france.com')
        console.log('\nUsage: node Gotcha [iso_manga] [chapter_number] [OPTION: -m || --mobile]\nexample: node Gotcha.js opc 924')
        console.log('\nGotcha: Gotcha.js file\n\niso_manga:\n',store,'\n\nchapter_number: Nth chapter available on scran-france.com')
        console.log('\nOption: Change the storage location via Termux home directory ~/storage/dcim/')
    } else {
        getURIs(scanURL).then(scansURI => {
            fs.mkdir(storage, (err) => {
                if (err) { 
                    console.error(`Chapter ${iso_m}-${nth} already exists or invalid path`); 
                    return err;
                }
                const scanPromise = scansURI.map((scanURI, idx) => {
                    return downloadScan(scanURI, idx)
                })
        
                Promise.all(scanPromise).then(completed => {
                    console.log("\x1b[32m",'\nDOWNLOADED',"\x1b[0m",`Chapter saved into ${storage}`)
                })
            })
        }).catch(error => { console.error(error) })
    }
}

process.on('uncaughtException', err => {
    console.error('Oops an error occured ...')
    process.exit(1);
});

Gotcha()
