Essinge Rovers IK - Public deploy guide
======================================

Goal
----
Make the app reachable from any computer with:
- login via e-mail + password
- shared club data
- shared invoices and bookkeeping
- stored data that survives restarts


How the app works now
---------------------
The app stores its shared data on the server in:
- `data/state.json`
- `data/accounts.json`
- `data/app.db`

`app.db` stores users and login sessions.

Important:
- If you deploy without persistent storage, your data can disappear on restart/redeploy.
- On Render you therefore need a persistent disk mounted to the app's `data` folder.


Recommended beginner setup
--------------------------
Use:
1. GitHub for code
2. Render for hosting

This app does not require Supabase or another external database right now.
It already has its own server-side login and storage.


Render settings
---------------
When you create the web service, use:
- Runtime: `Python`
- Build command: leave empty
- Start command: `python3 run_local.py`

Environment variables:
- `APP_SECURE_COOKIES=1`

Persistent disk:
- Mount path: `/opt/render/project/src/data`


What the first admin does
-------------------------
When the site opens for the first time:
1. The setup screen appears
2. Enter name, e-mail and password
3. Click `Skapa första admin`
4. Log in
5. Go to `Säkerhet`
6. Create more board accounts


Before going live
-----------------
Make sure you have filled in:
- club name
- organisation number
- bankgiro / swish

Those values are used in invoices and reminders.


Backup routine
--------------
Even in production you should still export backups regularly:
1. Open the app
2. Go to `Backup`
3. Click `Exportera full backup`
4. Save the file in at least two places


If the server is redeployed
---------------------------
As long as the persistent disk is attached to `data`, these survive:
- users
- passwords
- sessions
- bookkeeping
- members
- invoices
- account plan

If the disk is missing, data is not guaranteed to survive.
