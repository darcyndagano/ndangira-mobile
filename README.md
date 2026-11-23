
  # Mobile app interface design

  This is a code bundle for Mobile app interface design. The original project is available at https://www.figma.com/design/ITqRrMVF3D9gYQZUmgjSuH/Mobile-app-interface-design.

  ## Running the code

  This project uses pnpm, pinned by the `packageManager` field of `package.json`. With Node 24, run `corepack enable` once.

  Run `pnpm install` to install the dependencies.

  Run `pnpm dev` to start the development server, and `pnpm build` to build the app.
  
  ## Tester sur téléphone

  L'app Android est servie en `https://localhost` et appelle l'API de dev en `http://`. Seule la variante **debug** autorise ce trafic (cleartext et contenu mixte). La release garde les réglages par défaut : contenu mixte bloqué, cleartext refusé sur Android 9 et plus. Le téléphone et le PC doivent être sur le même réseau local.

  **Prérequis :** le backend est cloné dans `../ndangira` et installé selon son README, sa base est migrée (`manage.py migrate`) et un compte de test existe (par exemple créé avec `manage.py createsuperuser`).

  1. Trouver l'IP LAN du PC (`ip -4 addr` ou `hostname -I`). Ces commandes listent plusieurs adresses (docker, VPN…) : prenez celle de l'interface Wi-Fi/LAN partagée avec le téléphone, par exemple `192.168.1.20`.
  2. Lancer le backend sur toutes les interfaces, depuis `../ndangira`, avec le Python du virtualenv du backend :

     ```sh
     python manage.py runserver 0.0.0.0:8000
     ```

  3. Ouvrir le port 8000 au seul sous-réseau local (ou l'équivalent dans votre pare-feu si ce n'est pas ufw) :

     ```sh
     sudo ufw allow from 192.168.1.0/24 to any port 8000 proto tcp
     ```

     Pour le refermer après les tests :

     ```sh
     sudo ufw delete allow from 192.168.1.0/24 to any port 8000 proto tcp
     ```

  4. Construire le web avec l'IP du PC, puis synchroniser Android. L'URL est figée dans `dist/` au build, et `localhost` sur le téléphone désigne le téléphone lui-même :

     ```sh
     VITE_API_URL=http://<IP du PC>:8000 pnpm build
     npx cap sync android
     ```

     Passez l'IP en variable sur la ligne de commande, comme ci-dessus : elle prime sur le `.env` local. Ne la mettez pas dans `.env`, qui sert aussi à `pnpm dev`. Si vous oubliez la variable, c'est la valeur du `.env` (`localhost`) qui est figée et les appels échouent sur le téléphone.

  5. Activer le débogage USB ou sans fil sur le téléphone, puis **reconstruire l'APK debug** et l'installer. Il faut reconstruire l'APK après chaque `cap sync`, sinon on réinstalle un ancien APK qui garde l'ancienne `VITE_API_URL` :

     ```sh
     (cd android && ./gradlew installDebug)
     ```

     ou, en deux temps :

     ```sh
     (cd android && ./gradlew assembleDebug)
     adb install -r android/app/build/outputs/apk/debug/app-debug.apk
     ```

  6. Ouvrir l'app : la liste des annonces doit se charger et la connexion du compte de test doit réussir.

  **Si l'IP du PC change** (autre réseau, nouveau bail DHCP), les appels échouent : refaites l'étape 4 avec la nouvelle IP (`pnpm build` puis `npx cap sync android`), puis reconstruisez et réinstallez l'APK (étape 5).

  **En cas d'échec :**
  - Ouvrez `http://<IP du PC>:8000/` dans le navigateur du téléphone. Si la page ne répond pas, le problème vient du réseau (backend, pare-feu), pas de l'app.
  - Ouvrez `chrome://inspect` dans Chrome sur le PC pour voir les erreurs console et réseau du WebView de l'app.
  - Un Wi-Fi invité peut isoler les appareils les uns des autres : utilisez un autre réseau.

  **Vérifier que seule la debug est assouplie :**

  ```sh
  (cd android && ./gradlew :app:processDebugMainManifest :app:processReleaseMainManifest)
  ```

  Les manifests fusionnés sont sous `android/app/build/intermediates/merged_manifests/debug/` et `.../release/`. `usesCleartextTraffic="true"` doit figurer dans celui de la debug et être absent de celui de la release.
