const crypto=require('crypto'); function id(prefix){return `${prefix}-${Date.now()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;} module.exports={id};
