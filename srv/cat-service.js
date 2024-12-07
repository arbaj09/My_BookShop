// module.exports = (srv) => {

//     // Reply mock data for Books...
//     srv.on ('READ', 'Books', ()=>[
//       { ID:201, title:'Wuthering Heights', author_ID:101, stock:12 },
//       { ID:251, title:'The Raven', author_ID:150, stock:333 },
//       { ID:252, title:'Eleonora', author_ID:150, stock:555 },
//       { ID:271, title:'Catweazle', author_ID:170, stock:222 },
//     ])
   
//     // Reply mock data for Authors...
//     srv.on ('READ', 'Authors', ()=>[
//       { ID:101, name:'Emily Brontë' },
//       { ID:150, name:'Edgar Allen Poe' },
//       { ID:170, name:'Richard Carpenter' },
//     ])
   
//    }



module.exports = (srv) => {

    const {Books} = cds.entities ('my.bookshop')
  
    // Reduce stock of ordered books
    srv.before ('CREATE', 'Orders', async (req) => {
      const order = req.data
      if (!order.amount || order.amount <= 0)  return req.error (400, 'Order at least 1 book')
      const tx = cds.transaction(req)
      const affectedRows = await tx.run (
        UPDATE (Books)
          .set   ({ stock: {'-=': order.amount}})
          .where ({ stock: {'>=': order.amount},/*and*/ ID: order.book_ID})
      )
      if (affectedRows === 0)  req.error (409, "Sold out, sorry")
    })
  
    // Add some discount for overstocked books
    srv.after ('READ', 'Books', each => {
      if (each.stock > 111)  each.title += ' -- 11% discount!'
    })
  
  }
  
   