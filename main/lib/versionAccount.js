import {currentAccountsFileVersion} from '../../common/config';


/**
 * @param {Object} oldAccount
 * @returns {Object}
 */
export function migrateAccount(oldAccount) {
  const oldVersion = oldAccount.version;
  const account = JSON.parse(JSON.stringify(oldAccount));

  switch (oldVersion) {
    /*
        case 2:
          // ...
          // fallthrough

        case 3:
          // ...
          // fallthrough
    //*/

    case currentAccountsFileVersion:
      break;

    default:
      throw new Error(`unknown version: ${oldVersion}`);
  }

  return account;
}
