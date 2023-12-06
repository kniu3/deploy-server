
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user-model.js";

export default function configurePassport(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      User.findOne({ _id: jwt_payload._id })
        .exec()
        .then((user, err) => {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
    })
  );
}