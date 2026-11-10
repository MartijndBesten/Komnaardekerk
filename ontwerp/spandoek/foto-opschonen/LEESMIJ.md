# Auto's uit de voorbeeldfoto halen

Hulpscripts voor de impressie van het spandoek (de foto zelf staat niet in git).
Geen AI-model: weg, berm en vluchtheuvel zijn opnieuw opgebouwd uit lijnen die in de foto zijn gemeten.
De maten in de scripts horen bij die ene foto (1600 × 888).

```bash
python3 -m venv venv && ./venv/bin/pip install opencv-contrib-python-headless pillow numpy
python3 masker.py foto.jpg                  # masker.png: waar de auto's staan
./venv/bin/python links.py foto.jpg links.png      # witte auto en de twee erachter
./venv/bin/python rechts.py links.png zonder-autos.png   # het busje
python3 ../montage.py zonder-autos.png <uitmap>    # spandoek erin
```
