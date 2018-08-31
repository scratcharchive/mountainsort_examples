def default_lari_servers():
    ret=[]
    ret.append(dict(
        label='Public 1 (passcode=public)',
        LARI_ID='ece375048d28'
    ))
    ret.append(dict(
        label='Public 2 (passcode=public)',
        LARI_ID='dd5921ab5fc1'
    ))
    ret.append(dict(
        label='Flatiron cluster',
        LARI_ID='fdb573a66f50'
    ))
    ret.append(dict(
        label='Jeremy\'s laptop',
        LARI_ID='cb48a51bf9e5'
    ))
    ret.append(dict(
        label='Local computer',
        LARI_ID=''
    ))
    return ret