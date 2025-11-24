import * as accounts from './accounts'
import * as packs from './packs'
import * as sessions from './sessions'
import * as sharedPacks from './sharedPacks'
import * as stickers from './stickers'
import * as users from './users'
import * as verifications from './verifications'

export const schema = {
    ...accounts,
    ...packs,
    ...sessions,
    ...sharedPacks,
    ...stickers,
    ...users,
    ...verifications,
}
