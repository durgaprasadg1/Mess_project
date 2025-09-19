module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);   // runs your async controller
    } catch (err) {
      next(err);                  // forward errors to Express
    }
  };
};
// it is similar as 

// module.exports function(fn)  {
//     return function (req, res,next) {
//         fn(req,res,next).catch(next);
//     }
// }