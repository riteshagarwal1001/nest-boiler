const domain = require('./domain');
const cls = require('continuation-local-storage');
/* tslint:disable */
export class PrincipalContext {
    private static session: any;

    static getSession() {
        if (
            PrincipalContext.session != null &&
            PrincipalContext.session != 'undefined'
        ) {
            PrincipalContext.session = cls.getNamespace('session');
        } else {
            console.log('creating session from principal context');
            PrincipalContext.session = cls.createNamespace('session');
        }
        return PrincipalContext.session;
    }

    static get User(): any {
        return domain.get('context:user');
    }

    static set User(user: any) {
        try {
            domain.set('context:user', user);
            PrincipalContext.setKeys('user');
        } catch (exception) {
            console.log('no active context found');
        }
    }

    static save(key: string, value: any): any {
        if (!key) throw 'invalid key';
        domain.set('context:' + key.trim(), value);
        PrincipalContext.setKeys(key);
    }

    static get(key: string) {
        return domain.get('context:' + key.trim());
    }

    private static setKeys(key: string) {
        var keys: Array<any> = domain.get('context:_keys');
        if (keys == null) {
            domain.set('context:_keys', [key]);
        } else {
            if (keys.indexOf(key) < 0) {
                keys.push(key);
                domain.set('context:_keys', keys);
            }
        }
    }

    static getAllKeys() {
        return domain.get('context:_keys');
    }
}
/* tslint:enable */
