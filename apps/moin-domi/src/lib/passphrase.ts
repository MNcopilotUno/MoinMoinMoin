/**
 * Suggested passphrases for password links (password-links.md): five words from 256 northern ones,
 * 40 bits, drawn with `crypto.getRandomValues` (one byte = one word, no bias at 256). Original list.
 */
export const WORDS: readonly string[] = [
  'Möwe', 'Kutter', 'Hafen', 'Deich', 'Watt', 'Ebbe', 'Flut', 'Nebel', 'Teer', 'Anker', 'Boje', 'Mole',
  'Kai', 'Kran', 'Tau', 'Segel', 'Mast', 'Kiel', 'Ruder', 'Bug', 'Heck', 'Luke', 'Koje', 'Kombüse',
  'Brücke', 'Leuchtturm', 'Feuer', 'Lampe', 'Laterne', 'Kompass', 'Karte', 'Lotse', 'Fähre', 'Barkasse', 'Jolle', 'Ewer',
  'Schute', 'Hering', 'Scholle', 'Krabbe', 'Butt', 'Dorsch', 'Aal', 'Sprotte', 'Muschel', 'Auster', 'Qualle', 'Robbe',
  'Seehund', 'Kormoran', 'Austernfischer', 'Seeschwalbe', 'Reiher', 'Ente', 'Gans', 'Schwan', 'Kiebitz', 'Brachvogel', 'Strandläufer', 'Düne',
  'Strand', 'Sand', 'Kiesel', 'Priel', 'Sandbank', 'Hallig', 'Insel', 'Warft', 'Siel', 'Schleuse', 'Wehr', 'Graben',
  'Marsch', 'Geest', 'Moor', 'Heide', 'Wiese', 'Weide', 'Koppel', 'Reet', 'Dach', 'Giebel', 'Speicher', 'Fleet',
  'Kontor', 'Lager', 'Kiste', 'Fass', 'Tonne', 'Netz', 'Reuse', 'Haken', 'Leine', 'Knoten', 'Spleiß', 'Ölzeug',
  'Südwester', 'Mütze', 'Stiefel', 'Pullover', 'Schal', 'Handschuh', 'Kragen', 'Knopf', 'Tasche', 'Messer', 'Pfeife', 'Tabak',
  'Tee', 'Kluntje', 'Rum', 'Grog', 'Korn', 'Bier', 'Brötchen', 'Brot', 'Butter', 'Honig', 'Apfel', 'Birne',
  'Pflaume', 'Kirsche', 'Rhabarber', 'Grünkohl', 'Pinkel', 'Labskaus', 'Kartoffel', 'Zwiebel', 'Senf', 'Gurke', 'Matjes', 'Bückling',
  'Räucherfisch', 'Krabbenbrot', 'Franzbrötchen', 'Rundstück', 'Kuchen', 'Waffel', 'Pfannkuchen', 'Zucker', 'Salz', 'Pfeffer', 'Kümmel', 'Dill',
  'Petersilie', 'Schnittlauch', 'Morgen', 'Mittag', 'Abend', 'Nacht', 'Mond', 'Stern', 'Sonne', 'Wolke', 'Regen', 'Schauer',
  'Sturm', 'Brise', 'Böe', 'Wind', 'Nordwest', 'Südost', 'Hagel', 'Schnee', 'Frost', 'Dunst', 'Gewitter', 'Blitz',
  'Donner', 'Regenbogen', 'Himmel', 'Horizont', 'Welle', 'Brandung', 'Gischt', 'Strömung', 'Ufer', 'Klippe', 'Felsen', 'Stein',
  'Mauer', 'Pier', 'Steg', 'Treppe', 'Gasse', 'Platz', 'Markt', 'Kirche', 'Turm', 'Glocke', 'Uhr', 'Rathaus',
  'Bahnhof', 'Gleis', 'Zug', 'Fahrrad', 'Karre', 'Wagen', 'Schubkarre', 'Laden', 'Tresen', 'Kasse', 'Waage', 'Korb',
  'Eimer', 'Besen', 'Schaufel', 'Spaten', 'Harke', 'Zaun', 'Tor', 'Pforte', 'Fenster', 'Tür', 'Schwelle', 'Ofen',
  'Herd', 'Kessel', 'Kanne', 'Tasse', 'Becher', 'Teller', 'Schüssel', 'Löffel', 'Gabel', 'Kerze', 'Streichholz', 'Decke',
  'Kissen', 'Sofa', 'Sessel', 'Stuhl', 'Tisch', 'Bank', 'Hocker', 'Regal', 'Buch', 'Brief', 'Postkarte', 'Stempel',
  'Feder', 'Tinte', 'Kreide', 'Tafel', 'Pinsel', 'Farbe', 'Leinwand', 'Rahmen', 'Spiegel', 'Bild', 'Lied', 'Flöte',
  'Akkordeon', 'Trommel', 'Shanty', 'Tanz',
];

export function suggestPassphrase(words = 5): string {
  return [...crypto.getRandomValues(new Uint8Array(words))].map((b) => WORDS[b]!).join('-');
}
