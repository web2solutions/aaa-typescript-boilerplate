# Firebase Adapter

## Technology

Firebase Admin profile.

## Build Services with Firebase

1. Start local emulator container (if configured):

```bash
npm run docker:up:firebase
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=Firebase
AAA_FIREBASE_PROJECT_ID=aaa-dev
AAA_FIREBASE_CREDENTIALS_JSON=./path/to/service-account.json
```

3. Start service adapter.

