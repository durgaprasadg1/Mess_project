module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);  
    } catch (err) {
      next(err);               
    }
  };
};
// it is similar as 

// module.exports function(fn)  {
//     return function (req, res,next) {
//         fn(req,res,next).catch(next);
//     }
// }