Essinge Rovers IK - Lokal start på Windows
=========================================

Snabbstart (dubbelklick)
------------------------
1) Installera Python 3 på Windows:
   https://www.python.org/downloads/windows/
   Viktigt: markera "Add Python to PATH" under installation.

2) Öppna projektmappen på Windows (t.ex. C:\EssingeRoverAdmin).

3) Dubbelklicka på:
   start-local.bat

4) Appen öppnas i Chrome/Edge på:
   http://localhost:8080

5) När du stänger browserfönstret som öppnades av scriptet
   stoppas servern automatiskt.


Vart sparas data lokalt?
------------------------
Appen körs lokalt med en liten lokal server (run_local.py) som sparar data i riktiga filer.

Datamapp:
  data\

Filer:
- data\state.json
- data\accounts.json
- data\app.db

Appen använder även en browserprofil för lokal webbläsardata:
- .browser-profile\
- den behövs för smidig körning, men "sanningen" för backup ligger i data\-filerna.

OBS:
- För backup: kopiera alltid hela mappen "data\".
- Om du byter dator: kopiera hela appmappen inklusive "data\" och ".browser-profile\".


Hur bilagor (PDF/bild) lagras
-----------------------------
Bilagor lagras inuti data\state.json (som data-URL), inte som separata filer i en vanlig mapp.
Det är därför viktigt att:
- använda "Exportera full backup" regelbundet
- spara backup-filen på USB/OneDrive


Rekommenderad backup-rutin
--------------------------
1) Gå till "Backup och import (Admin)" i appen.
2) Klicka "Exportera full backup".
3) Spara filen på minst 2 ställen (USB + moln).
4) Vid ny dator:
   - starta appen
   - klicka "Importera full backup"
   - välj backup-filen


Vanliga problem
---------------
Problem: Inget händer när du dubbelklickar start-local.bat
Lösning:
- Kontrollera att Python är installerat.
- Testa i CMD:
  py --version

Problem: Browser öppnas men sidan laddar inte
Lösning:
- Kontrollera att port 8080 är ledig.
- Stäng andra lokala servrar och prova igen.
