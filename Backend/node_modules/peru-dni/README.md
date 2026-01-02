# peru-dni

![npm](https://img.shields.io/npm/v/peru-dni)
![npm bundle size](https://img.shields.io/bundlephobia/min/peru-dni)
![GitHub stars](https://img.shields.io/github/stars/ChoqueCastroLD/peru-dni?style=plastic)

Node module to fetch real name from peruvian's dni

How to Install:

  Using npm:
    
    > $ npm install peru-dni --save
    

How to use:

  (Nodejs example)
 
```javascript
const perudni = require('peru-dni');

// using Promises
perudni.getNameFromDNI(71747104)
    .then(data => {
        console.log('Real name is ' + data.fullname);
    })
    .catch(err => {
        console.log('Something went wrong ', err);
    });

// using async/await
async function main() {
    try {
        let data = await perudni.getNameFromDNI(71747104);

        console.log(`${data.dni} > ${data.fullname}`);
    } catch (err) {
        console.log('Something went wrong ', err);
    }
}
main();
    
```

getNameFromDNI()
If everything works well it will return an object like this:
```javascript
{
    dni: '00000003',
    fullname: 'CARLOTA MEZA DE RUIZ',
    lastname: 'MEZA',
    secondlastname: 'DE RUIZ',
    name: 'CARLOTA'
}
```
If there's no one with that DNI
```javascript
{
    dni: '00000000',
    error: 'DNI no encontrado en Padrón Electoral',
    message: 'Cant get name from that DNI'
}
```
If there's no connection with the external public API, it will throw an error 
```javascript
'Fetch failed'
```


Run tests with
> $ npm run test