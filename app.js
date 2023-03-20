const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const morgan = require('morgan')
const { check, validationResult } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
var methodOverride = require('method-override')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(morgan('dev'))
app.use(express.static('public'))

// middleware url encoded
app.use(express.urlencoded({ extended: true }))

// session and flash configuration
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 600 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())

// route
app.get('/', (req, res) => {
    const user = [
        {
            nama: 'Muhammad Ramadhan',
            email: 'ramadhannkurniawan@gmail.com',
        },
        {
            nama: 'Andi Budiman',
            email: 'andibudiman@gmail.com',
        },
        {
            nama: 'Haris Sampurna',
            email: 'harissampurna@gmail.com',
        },
    ]
    res.render('index', {
        title: 'Home',
        nama: 'Ramadhan',
        user,
        layout: 'layout/main'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About',
        layout: 'layout/main'
    })
})

// show contact list
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    res.render('contact', {
        title: 'Contact',
        layout: 'layout/main',
        contacts,
        message: req.flash('message')
    })
})

// form for add new contact
app.get('/contact/add', (req, res) => {
    res.render('add', {
        title: 'Add New Contact',
        layout: 'layout/main',
        contact: req.body
    })
})

// post contact data
app.post('/contact', [
    check('name', 'Name value must be a string!').isString(),
    check('email', 'Email is not valid!').isEmail().custom(async (value) => {
        const duplicate = await Contact.findOne({ email: value })
        if (duplicate) {
            throw new Error('E-mail already in use')
        } else {
            return true;
        }
    }),
    check('phone', 'Phone number is not valid!').isMobilePhone('id-ID').custom(async (value) => {
        const duplicate = await Contact.findOne({ phone: value })
        if (duplicate) {
            throw new Error('Phone number is already registered!')
        } else {
            return true
        }
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400)
        res.render('add', {
            title: 'Add New Contact',
            layout: 'layout/main',
            errors: errors.array(),
            contact: req.body
        });
    } else {
        const newContact = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            insertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        await Contact.insertMany(newContact).then(() => {
            res.status(201)
            req.flash('message', 'Contact saved successfully!')
            res.redirect('/contact')
        })
    }
})

// form for edit contact
app.get('/contact/edit/:id', async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    res.render('edit', {
        title: 'Edit Contact',
        layout: 'layout/main',
        contact
    })
})

// post edit data
app.put('/contact/update', [
    check('name', 'Name value must be a string!').isString(),
    check('email', 'Email is not valid!').isEmail().custom(async (value, { req }) => {
        const duplicate = await Contact.findOne({ email: value })
        if (value !== req.body.oldEmail && duplicate) {
            throw new Error('E-mail already in use')
        } else {
            return true
        }
    }),
    check('phone', 'Phone number is not valid!').isMobilePhone('id-ID').custom(async (value, { req }) => {
        const duplicate = await Contact.findOne({ phone: value })
        if (value !== req.body.oldPhone && duplicate) {
            throw new Error('Phone number is already registered!')
        } else {
            return true
        }
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        res.render('edit', {
            title: 'Edit Contact',
            layout: 'layout/main',
            errors: errors.array(),
            contact: req.body
        });
    } else {
        await Contact.findByIdAndUpdate(req.body.id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            updatedAt: new Date().toISOString()
        }).then(() => {
            req.flash('message', 'Contact updated successfully!');
            res.redirect('/contact')
        });
    }
})

// delete kontak
app.delete('/contact', async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.body.id)
    // if contact doesn't exist
    if (!contact) {
        res.status(404).render('404', {
            title: 'Request Not Found',
            layout: 'layout/main'
        })
    }
    req.flash('message', 'Contact deleted successfully!')
    res.redirect('/contact')
})

// show contact detail
app.get('/contact/:id', async (req, res) => {
    const contact = await Contact.findById(req.params.id)
    res.render('detail', {
        title: 'Detail Contact',
        layout: 'layout/main',
        contact
    })
})

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Request Not Found',
        layout: 'layout/main'
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})