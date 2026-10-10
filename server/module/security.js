import argon2 from "argon2";

import crypto from "crypto";
const security = {
    async converthash(password) {
        try {
            const hash = await argon2.hash(password);
            return hash;
        } catch (err) {
            console.log('password Hash fails');
        }
    },
    async compare(hash, password) {
        try {
            if (await argon2.verify(hash, password)) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    },
   async Genotp (length = 6){
        let otp = "";
        for (let i = 0; i < length; i++) {
            otp += crypto.randomInt(0, 10);
        }
        return otp;

    }

}


export default security;