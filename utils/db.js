const mongoose = require('mongoose')

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/belajar');
}

main().catch(err => console.log(err));

// add a data
// const firstContact = new Contact({
//     name: 'Muhammad Ramadhan',
//     email: 'ramadhannkurniawan@gmail.com',
//     phone: '081282650022',
//     insertedAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
// })

// // save to collection
// firstContact.save().then((contact) => console.log(contact))