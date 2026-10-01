# SOURCES

The consolidated bibliography of the British Empire Atlas, and a plain statement of the
arguments this dataset takes a side in, the arguments it refuses to settle, and the numbers
it gives as ranges because nobody has better than a range.

Ten regional historians wrote the dataset against one shared model. This file is the general
editor's consolidation: 1,342 citation instances, 629 distinct works, deduplicated and
grouped. Nothing here was invented. Where a figure could not be sourced it is absent from
the data, not estimated into it.

---

## 1. How a source is attached to a claim

Every territory carries an `evidence` array of one to three works, and acquisitions,
departures and events may carry their own. A citation is a small object:

```json
{ "author": "Caroline Elkins",
  "work": "Britain's Gulag: The Brutal End of Empire in Kenya",
  "year": 2005, "kind": "book", "publisher": "Jonathan Cape",
  "supports": "The scale of detention during the Kenya Emergency." }
```

`supports` says what the work is doing there, so a reader can tell an authority for a
death toll from an authority for a date. `kind` is one of `book`, `chapter`, `article`,
`primary-source`, `official-record`, `reference-work`, `dataset`.

Three rules governed the writing, and they are worth knowing before you use the atlas:

1. **No invented citation, ever.** A work appears only if the writer was confident it
   exists as author, title and year. Where a specific page could not be verified, the
   general work is cited without a page rather than a plausible-looking locator.
2. **A contested figure is given as a range with the reason for the doubt**, never as a
   single number with a false air of precision. See §4.
3. **Absence of evidence is stated.** `confidence: "low"` and a note in the text, rather
   than silence that reads like certainty.

Run `node tools/validate-data.js` to check the whole dataset, and
`node tools/audit-timeline.js --check` to test the numbers against what a historian would
accept.

---

## 2. Where this atlas takes a position

These are real disagreements. In each case the dataset picks an answer, and this section
says which and why, so that a teacher can disagree with it in class on the evidence.

**The empire's territorial peak is dated 1920–22, and the atlas computes it rather than
quoting it.** Running `tools/audit-timeline.js` over the dataset gives 33,533,305 km² in
1922 — 25.0% of the world's land outside Antarctica. The conventional figure is about
33.7 million km². The atlas therefore agrees with the textbooks, but it agrees by
calculation, and the calculation can be re-run and attacked. The same tool shows something
the textbooks do not: measured by land actually under British administration, the empire
was very nearly as large in **1947** (33.4 million km²), because Britain was then running
Libya, Eritrea, Italian Somaliland, occupied Germany and Ethiopia's administration on top
of everything else. The physical peak and the political peak are not the same year.

**"Informal empire" is drawn on the map.** Following Gallagher and Robinson's *The
Imperialism of Free Trade* (1953), the atlas includes Argentina, Uruguay, Persia, Siam,
the Ottoman Empire, Egypt before 1882 and the China treaty-port system as territories with
status `informal-sphere`. Historians who think this stretches the word "empire" past use
have a case, and the atlas answers it by giving those records `controlDegree` 0 or 1 and by
saying in every one of them that no British flag flew. Leaving them off would make the
empire look far smaller and far more legal than it was.

**Britain did not "acquire" places; it took them.** The vocabulary of the data model has no
neutral verb for conquest. `acquisitionMechanism` forces a writer to choose between
`conquest`, `settlement`, `treaty-cession`, `protectorate-declared` and the rest, and every
acquisition must name a `counterparty` and say what they lost. This is a position: it holds
that the passive voice of older imperial history is itself a historical claim.

**Settlement was not on empty land.** Records for Virginia, New South Wales, Van Diemen's
Land and the Cape state the population that was there, name the peoples, and treat
*terra nullius* as a legal doctrine invented for a purpose rather than a description of
the country. The atlas follows Henry Reynolds and the post-*Mabo* literature here, against
the older settlement narrative.

**Famine in India is treated as a policy question, not a weather question.** The Bengal
famine of 1943 and the famines of 1876–78 and 1896–1902 are recorded with the export
figures and the relief decisions alongside the rainfall, following Amartya Sen's
entitlement analysis and Mike Davis's *Late Victorian Holocausts*. Tirthankar Roy's
argument that colonial policy mattered less than climate and market failure is named in the
records as a live counter-position, not suppressed.

**The Kenya Emergency is recorded at the scale the archives now support.** Caroline
Elkins's *Britain's Gulag* (2005) and David Anderson's *Histories of the Hanged* (2005)
disagree about totals; the 2011 Mau Mau litigation and the "migrated archive" released
after it are treated as settling the fact of systematic detention and abuse, and not as
settling the death toll. Both numbers appear.

**The dominions are kept on the map until their contested independence ends, not until it
begins.** Canada to 1982, Australia to 1986, New Zealand to 1987, South Africa to 1961. A
map that removes Canada in 1931 teaches that the empire halved between the wars, which is
false; a map that keeps Canada in 1970 teaches that Britain governed it, which is also
false. The atlas keeps the extent and drops the `controlDegree` to 1 or 0, and shows both
columns. **This was an editorial correction**: the ten regional shards had originally
treated the four dominions three different ways.

**Ireland is in the atlas.** Not as a courtesy: the plantation, the penal laws, the
Ascendancy, coercion acts, the constabulary model and the men who ran them were the
rehearsal for a great deal of what followed elsewhere. Recording Ireland only as part of
the United Kingdom, and not as a place governed as a colony, would hide that.

**Slavery and abolition are treated as one continuous story with an economic hinge.**
The atlas records that abolition in 1833 paid £20 million to slave-owners — 40% of the
Treasury's annual budget, a loan not finally repaid until 2015 — and that the freed people
were made to work unpaid as "apprentices" until 1838. This follows the Legacies of British
Slavery database and Nicholas Draper's *The Price of Emancipation*. It does not follow the
older account in which abolition is simply a moral triumph, and it does not follow Eric
Williams's strongest claim that abolition was purely economic self-interest — Christopher
Leslie Brown's *Moral Capital* is cited for the case that the campaign was genuine and
that it also served British interests.

**Partition is recorded as a British act with British authorship.** India 1947, Palestine
1948, Ireland 1921, Cyprus in effect after 1974: the lines, the men who drew them, the
weeks they had, and the death and displacement tolls are in the data, with the tolls as
ranges. The atlas does not adopt the view that partition violence was purely communal and
locally generated, nor the view that it was purely engineered from London.

---

## 3. Where this atlas refuses to decide

149 of the 260 territory records carry an explicit `contested` block, and the app shows it.
A `contested` object names the positions and who holds them:

```json
"contested": { "isContested": true, "note": "...",
  "positions": [ { "claim": "...", "heldBy": "..." } ] }
```

Dates can also be contested in themselves. `precision: "contested"` with an `end` value
means the atlas is showing a range, not a date. The largest cases:

| Question | The range the atlas shows | Why it is not settled |
|---|---|---|
| When did Canada become independent? | 1867 · 1926 · **1931** · 1982 | Self-government, the Balfour formula, the Statute of Westminster, patriation. Canadian courts have used all four. |
| When did Australia? | 1901 · 1942 · **1986** | The Australia Acts ended the last British power over the states; courts have used 1901 and 1942 for other purposes. |
| New Zealand? | 1907 · 1947 · **1987** | There is no independence day, and no New Zealand government has ever asked for one. |
| South Africa? | 1910 · **1931** · 1934 · 1961 | The Union was self-governing from 1910 and a republic outside the Commonwealth from 1961. |
| Who owns the Falklands / Malvinas? | Unresolved | The atlas states the 1833 expulsion, the continuous British population since, the Argentine claim, and the UN's position that a dispute exists. |
| Was the Indian Reserve of 1763 British? | Argued in the record | It is drawn, at `controlDegree` 3, with a note that the nations inside it governed themselves and did not consider themselves subjects. |
| Did the Fort Pitt smallpox blankets cause the epidemic? | Attempt documented, effect disputed | The ledger, Trent's journal and the Amherst–Bouquet letters prove the attempt was made and approved. The epidemiology is not settled. |
| Was the Central African Federation an economic union or settler expansion? | Both readings given | Welensky's account against the post-Devlin scholarship. |
| Was the East India Company a British state actor or a rogue corporation? | Both readings given | It is the difference between blaming a firm and blaming a country, and the answer changes across 1757, 1784 and 1858. |
| Did British rule cause Indian de-industrialisation? | Both readings given | Bagchi and Habib against Roy and Clingingsmith–Williamson. |

---

## 4. Numbers this atlas gives as ranges

Every one of these is a range in the data with the counting method in the note, because
the sources will not support a point figure. Reporting the midpoint alone would be the
error, not the caution.

| | Range in the data | Why it is a range |
|---|---|---|
| Transatlantic slave trade, British ships | c.3.1 million embarked, c.2.7 million landed | Voyage records are near-complete; the numbers aboard each ship are not. Eltis and Richardson's *Atlas of the Transatlantic Slave Trade* is the source. |
| Bengal famine 1943 | 2.1–3.0 million dead | Depends on whether excess mortality is counted for 1943 alone or through 1946. |
| Great Famine, Ireland 1845–52 | c.1 million dead, c.1 million emigrated | The 1851 census is the only baseline and it undercounts the west. |
| Indian famines 1876–78 and 1896–1902 | 5.5–12 million combined | Colonial mortality returns are incomplete for exactly the districts worst hit. |
| Partition of India 1947 | 200,000–2 million killed; 12–18 million displaced | No census was taken; the range is between the official and the demographic estimates. |
| South African War concentration camps | c.28,000 Boer dead; ≥20,000 African dead | The Boer camp registers survive. The African camp registers largely do not. |
| Kenya Emergency 1952–60 | 11,000–25,000+ killed; ≥80,000 detained | Official figures against Elkins's demographic estimate; the destroyed and migrated archives sit in between. |
| Amritsar 1919 | 379 (official) – c.1,000 (Congress) | The Hunter Committee counted bodies claimed; the crowd was penned and many were removed by families. |
| Acadian expulsion 1755–64 | 10,000–12,000 deported, c.a third dead | Parish and shipping records are incomplete. |
| King Philip's War 1675–76 | 4,000–9,000 dead | Colonial deaths are documented; Indigenous deaths are not. |
| Enslaved people who fled to British lines, 1775–83 | c.20,000 | Cassandra Pybus's reconstruction, against the older and unsupported figure of 100,000. |
| Garifuna deportation 1797 | c.2,500 of c.5,000 died on Balliceaux | The muster rolls before and after the detention are the only evidence. |
| Nyasaland emergency 1959 | 51 killed, 1,300+ detained | The Devlin Commission counted to July 1959 only. |

---

## 5. What the evidence base is thin on

Stated so it is not mistaken for coverage:

- **Populations before censuses.** Pre-1800 figures for anywhere outside Europe are
  estimates built on estimates. Where the atlas gives one it says whose.
- **Indigenous mortality.** Colonial governments counted their own dead carefully and
  other people's dead badly or not at all. Almost every asymmetric range above is this
  asymmetry showing.
- **Sub-unit geography.** The map's smallest drawable pieces are modern administrative
  outlines, so some real historical borders cannot be drawn: the Anglo-French partition of
  St Kitts before 1713, the Labrador transfers, Walvis Bay inside German South West Africa,
  the Alaska panhandle leased to the Hudson's Bay Company, the Kalinago Territory on
  Dominica, the three separate Guiana colonies before 1831. Each is stated in the prose of
  the record that would otherwise be silently wrong. See `geo_gaps` in the shard notes.
- **Non-English sources.** The dataset leans on the anglophone literature. For the Dutch,
  French, Portuguese, Danish and Spanish colonies that Britain captured and returned, and
  for the Indian-language and African-language record, this is a real limit.

---

## 6. The bibliography

Grouped by the region of the dataset that cites it, alphabetically by author. A work used
in more than one region is listed under each. Deduplicated from 1,342 citation instances
to 629 distinct works.

### The general library

Works that describe the empire as a whole, cited across several regions of the dataset.

- **Ashley Jackson**, *The British Empire and the Second World War* (2006) · Hambledon Continuum
- **Christopher Alan Bayly**, *Imperial Meridian: The British Empire and the World 1780-1830* (1989) · Longman
- **David Cannadine**, *Ornamentalism: How the British Saw Their Empire* (2001) · Allen Lane
- **David Eltis and David Richardson**, *Atlas of the Transatlantic Slave Trade* (2010) · Yale University Press
- **Frederick Lugard**, *The Dual Mandate in British Tropical Africa* (1922) · William Blackwood and Sons · primary source
- **John Darwin**, *The Empire Project: The Rise and Fall of the British World-System, 1830-1970* (2009) · Cambridge University Press
- **John Darwin**, *Unfinished Empire: The Global Expansion of Britain* (2012) · Allen Lane
- **John Gallagher and Ronald Robinson**, *The Imperialism of Free Trade* (1953) · The Economic History Review · article
- **Linda Colley**, *Britons: Forging the Nation 1707-1837* (1992) · Yale University Press
- **Linda Colley**, *Captives: Britain, Empire and the World, 1600-1850* (2002) · Jonathan Cape
- **P. J. Cain and A. G. Hopkins**, *British Imperialism: Innovation and Expansion 1688-1914* (1993) · Longman
- **P. J. Marshall**, *The Making and Unmaking of Empires: Britain, India, and America c.1750-1783* (2005) · Oxford University Press
- **Ronald Hyam**, *Britain's Imperial Century, 1815-1914: A Study of Empire and Expansion* (2002) · Palgrave Macmillan
- **Ronald Hyam**, *Britain's Declining Empire: The Road to Decolonisation, 1918-1968* (2006) · Cambridge University Press
- **Ronald Robinson and John Gallagher**, *Africa and the Victorians: The Official Mind of Imperialism* (1961) · Macmillan

### East, Southern and North Africa, and the western Indian Ocean

_71 works, cited by `app/data/territories/africa-east-south.json`._

- **A. Adu Boahen (ed.)**, *General History of Africa, Volume VII: Africa under Colonial Domination 1880-1935* (1985) · UNESCO and Heinemann · reference work
- **Abdul Sheriff**, *Slaves, Spices and Ivory in Zanzibar: Integration of an East African Commercial Empire into the World Economy, 1770-1873* (1987) · James Currey
- **Afaf Lutfi al-Sayyid Marsot**, *A History of Egypt: From the Arab Conquest to the Present* (2007) · Cambridge University Press
- **Andrew Cohen**, *The Politics and Economics of Decolonization in Africa: The Failed Experiment of the Central African Federation* (2017) · I.B. Tauris
- **Andrew Roberts**, *A History of Zambia* (1976) · Heinemann
- **Bahru Zewde**, *A History of Modern Ethiopia, 1855-1991* (2001) · James Currey
- **Bethwell A. Ogot and William R. Ochieng**, *Decolonization and Independence in Kenya, 1940-93* (1995) · James Currey
- **Caroline Elkins**, *Britain's Gulag: The Brutal End of Empire in Kenya* (2005) · Jonathan Cape
- **Charles Miller**, *The Lunatic Express: An Entertainment in Imperialism* (1971) · Macmillan
- **Charles Perrings**, *Black Mineworkers in Central Africa* (1979) · Heinemann
- **Charles van Onselen**, *New Babylon, New Nineveh: Everyday Life on the Witwatersrand 1886-1914* (1982) · Ravan Press
- **Christopher Clapham**, *Haile-Selassie's Government* (1969) · Longmans
- **Colin Bundy**, *The Rise and Fall of the South African Peasantry* (1979) · Heinemann
- **David Anderson**, *Histories of the Hanged: Britain's Dirty War in Kenya and the End of Empire* (2005) · Weidenfeld and Nicolson
- **David Anderson**, *Guilty Secrets: Deceit, Denial and the Discovery of Kenya's 'Migrated Archive'* (2015) · History Workshop Journal · article
- **David Beach**, *War and Politics in Zimbabwe, 1840-1900* (1986) · Mambo Press
- **David Martin and Phyllis Johnson**, *The Struggle for Zimbabwe: The Chimurenga War* (1981) · Faber and Faber
- **Dirk Vandewalle**, *A History of Modern Libya* (2012) · Cambridge University Press
- **Douglas H. Johnson**, *Nuer Prophets: A History of Prophecy from the Upper Nile in the Nineteenth and Twentieth Centuries* (1994) · Clarendon Press
- **Douglas H. Johnson**, *The Root Causes of Sudan's Civil Wars* (2003) · James Currey
- **E.E. Evans-Pritchard**, *The Sanusi of Cyrenaica* (1949) · Clarendon Press
- **Edward Paice**, *Tip and Run: The Untold Tragedy of the Great War in Africa* (2007) · Weidenfeld and Nicolson
- **Elizabeth A. Eldredge**, *A South African Kingdom: The Pursuit of Security in Nineteenth-Century Lesotho* (1993) · Cambridge University Press
- **Elizabeth van Heyningen**, *The Concentration Camps of the Anglo-Boer War: A Social History* (2013) · Jacana Media
- **G.K.N. Trevaskis**, *Eritrea: A Colony in Transition, 1941-52* (1960) · Oxford University Press · primary source
- **Geoffrey Hodges**, *The Carrier Corps: Military Labor in the East African Campaign, 1914-1918* (1986) · Greenwood Press
- **George Shepperson and Thomas Price**, *Independent African: John Chilembwe and the Origins, Setting and Significance of the Nyasaland Native Rising of 1915* (1958) · Edinburgh University Press
- **Hilda Kuper**, *Sobhuza II, Ngwenyama and King of Swaziland* (1978) · Duckworth
- **Holly Hanson**, *Landed Obligation: The Practice of Power in Buganda* (2003) · Heinemann
- **Huw Bennett**, *Fighting the Mau Mau: The British Army and Counter-Insurgency in the Kenya Emergency* (2013) · Cambridge University Press
- **I.M. Lewis**, *A Modern History of the Somali: Nation and State in the Horn of Africa* (2002) · James Currey
- **Jeff Guy**, *The Destruction of the Zulu Kingdom: The Civil War in Zululand, 1879-1884* (1979) · Longman
- **Jeff Peires**, *The Dead Will Arise: Nongqawuse and the Great Xhosa Cattle-Killing Movement of 1856-7* (1989) · Ravan Press
- **John Iliffe**, *A Modern History of Tanganyika* (1979) · Cambridge University Press
- **John Laband**, *Rope of Sand: The Rise and Fall of the Zulu Kingdom in the Nineteenth Century* (1995) · Jonathan Ball
- **John McCracken**, *A History of Malawi, 1859-1966* (2012) · James Currey
- **Jonathon Glassman**, *War of Words, War of Stones: Racial Thought and Violence in Colonial Zanzibar* (2011) · Indiana University Press
- **Juan Cole**, *Colonialism and Revolution in the Middle East: Social and Cultural Origins of Egypt's Urabi Movement* (1993) · Princeton University Press
- **Keith Kyle**, *Suez: Britain's End of Empire in the Middle East* (1991) · Weidenfeld and Nicolson
- **Leonard Thompson**, *The Unification of South Africa, 1902-1910* (1960) · Oxford University Press
- **Leonard Thompson**, *Survival in Two Worlds: Moshoeshoe of Lesotho, 1786-1870* (1975) · Clarendon Press
- **Leonard Thompson**, *A History of South Africa* (2001) · Yale University Press
- **Luise White**, *Unpopular Sovereignty: Rhodesian Independence and African Decolonization* (2015) · University of Chicago Press
- **Marion Wallace**, *A History of Namibia: From the Beginning to 1990* (2011) · Hurst
- **Mark Bradbury**, *Becoming Somaliland* (2008) · James Currey
- **Martin Daly**, *Empire on the Nile: The Anglo-Egyptian Sudan, 1898-1934* (1986) · Cambridge University Press
- **Martin Daly**, *Imperial Sudan: The Anglo-Egyptian Condominium 1934-1956* (1991) · Cambridge University Press
- **Neil Parsons**, *King Khama, Emperor Joe and the Great White Queen: Victorian Britain through African Eyes* (1998) · University of Chicago Press
- **Nigel Worden**, *The Making of Modern South Africa: Conquest, Apartheid, Democracy* (2012) · Wiley-Blackwell
- **Noel Mostert**, *Frontiers: The Epic of South Africa's Creation and the Tragedy of the Xhosa People* (1992) · Jonathan Cape
- **Patrick Devlin (chair)**, *Report of the Nyasaland Commission of Inquiry, Cmnd 814* (1959) · HMSO · official record
- **Peter Delius**, *The Land Belongs to Us: The Pedi Polity, the Boers and the British in the Nineteenth-Century Transvaal* (1983) · Ravan Press
- **Peter Malcolm Holt and Martin Daly**, *A History of the Sudan: From the Coming of Islam to the Present Day* (2011) · Routledge
- **Peter Warwick**, *The South African War: The Anglo-Boer War 1899-1902* (1980) · Longman
- **Peter Warwick**, *Black People and the South African War 1899-1902* (1983) · Cambridge University Press
- **Phares Mutibwa**, *Uganda since Independence: A Story of Unfulfilled Hopes* (1992) · Hurst
- **Philip Bonner**, *Kings, Commoners and Concessionaires: The Evolution and Dissolution of the Nineteenth-Century Swazi State* (1983) · Cambridge University Press
- **Priya Satia**, *Spies in Arabia: The Great War and the Cultural Foundations of Britain's Covert Empire in the Middle East* (2008) · Oxford University Press
- **Robert I. Rotberg**, *The Rise of Nationalism in Central Africa: The Making of Malawi and Zambia, 1873-1964* (1965) · Harvard University Press
- **Robert V. Turrell**, *Capital and Labour on the Kimberley Diamond Fields, 1871-1890* (1987) · Cambridge University Press
- **Ruth Iyob**, *The Eritrean Struggle for Independence: Domination, Resistance, Nationalism, 1941-1993* (1995) · Cambridge University Press
- **Saul Dubow**, *Apartheid, 1948-1994* (2014) · Oxford University Press
- **Shula Marks**, *Reluctant Rebellion: The 1906-8 Disturbances in Natal* (1970) · Clarendon Press
- **Shula Marks and Stanley Trapido**, *The Politics of Race, Class and Nationalism in Twentieth-Century South Africa* (1987) · Longman
- **Sol Plaatje**, *Native Life in South Africa* (1916) · P.S. King and Son · primary source
- **Susan Pedersen**, *The Guardians: The League of Nations and the Crisis of Empire* (2015) · Oxford University Press
- **Susan Williams**, *Colour Bar: The Triumph of Seretse Khama and His Nation* (2006) · Allen Lane
- **Terence Ranger**, *Revolt in Southern Rhodesia 1896-7: A Study in African Resistance* (1967) · Heinemann
- **Thomas Pakenham**, *The Boer War* (1979) · Weidenfeld and Nicolson
- **Thomas Tlou and Alec Campbell**, *History of Botswana* (1984) · Macmillan Botswana
- **Winston S. Churchill**, *The River War: An Historical Account of the Reconquest of the Soudan* (1899) · Longmans, Green and Co. · primary source

### West Africa

_46 works, cited by `app/data/territories/africa-west.json`._

- **A. Adu Boahen**, *Yaa Asantewaa and the Asante-British War of 1900-1* (2003) · James Currey
- **Adam Hochschild**, *Bury the Chains: The British Struggle to Abolish Slavery* (2005) · Macmillan
- **Adiele E. Afigbo**, *The Warrant Chiefs: Indirect Rule in Southeastern Nigeria 1891-1929* (1972) · Longman
- **Arnold Hughes and David Perfect**, *A Political History of the Gambia, 1816-1994* (2006) · University of Rochester Press
- **Basil Davidson**, *Black Star: A View of the Life and Times of Kwame Nkrumah* (1973) · Allen Lane
- **Chinua Achebe**, *There Was a Country: A Personal History of Biafra* (2012) · Penguin
- **Christopher Fyfe**, *A History of Sierra Leone* (1962) · Oxford University Press
- **D.E.K. Amenumey**, *The Ewe Unification Movement: A Political History* (1989) · Ghana Universities Press
- **Dan Hicks**, *The Brutish Museums: The Benin Bronzes, Colonial Violence and Cultural Restitution* (2020) · Pluto Press
- **David Hancock**, *Citizens of the World: London Merchants and the Integration of the British Atlantic Community, 1735-1785* (1995) · Cambridge University Press
- **David Kimble**, *A Political History of Ghana: The Rise of Gold Coast Nationalism, 1850-1928* (1963) · Oxford University Press
- **Dennis Austin**, *Politics in Ghana, 1946-1960* (1964) · Oxford University Press
- **Donald R. Wright**, *The World and a Very Small Place in Africa: A History of Globalization in Niumi, The Gambia* (2004) · M.E. Sharpe
- **Elizabeth Isichei**, *A History of the Igbo People* (1976) · Macmillan
- **Emma Christopher**, *A Merciless Place: The Fate of Britain's Convicts after the American Revolution* (2011) · Oxford University Press
- **Ivor Wilks**, *Asante in the Nineteenth Century: The Structure and Evolution of a Political Order* (1975) · Cambridge University Press
- **J.F.A. Ajayi**, *Christian Missions in Nigeria 1841-1891: The Making of a New Elite* (1965) · Longman
- **Joe A.D. Alie**, *A New History of Sierra Leone* (1990) · Macmillan
- **John D. Hargreaves**, *Prelude to the Partition of West Africa* (1963) · Macmillan
- **John de St Jorre**, *The Nigerian Civil War* (1972) · Hodder and Stoughton
- **John Iliffe**, *Africans: The History of a Continent* (1995) · Cambridge University Press
- **Judith Van Allen**, *Sitting on a Man: Colonialism and the Lost Political Institutions of Igbo Women* (1972) · Canadian Journal of African Studies · article
- **Kristin Mann**, *Slavery and the Birth of an African City: Lagos, 1760-1900* (2007) · Indiana University Press
- **Martin Lynn**, *Commerce and Economic Change in West Africa: The Palm Oil Trade in the Nineteenth Century* (1997) · Cambridge University Press
- **Michael Crowder**, *The Story of Nigeria* (1962) · Faber and Faber
- **Michael Crowder**, *West Africa under Colonial Rule* (1968) · Hutchinson
- **Murray Last**, *The Sokoto Caliphate* (1967) · Longman
- **Padraic X. Scanlan**, *Freedom's Debtors: British Antislavery in Sierra Leone in the Age of Revolution* (2017) · Yale University Press
- **Paul E. Lovejoy and Jan S. Hogendorn**, *Slow Death for Slavery: The Course of Abolition in Northern Nigeria, 1897-1936* (1993) · Cambridge University Press
- **Philip D. Curtin**, *The Atlantic Slave Trade: A Census* (1969) · University of Wisconsin Press
- **Philip D. Curtin**, *Economic Change in Precolonial Africa: Senegambia in the Era of the Slave Trade* (1975) · University of Wisconsin Press
- **Piet Konings and Francis B. Nyamnjoh**, *Negotiating an Anglophone Identity: A Study of the Politics of Recognition and Representation in Cameroon* (2003) · Brill
- **Ralph A. Austen**, *The Slave Trade as History and Memory: Confrontations of Slaving Voyage Documents and Communal Traditions* (2001) · William and Mary Quarterly · article
- **Richard Rathbone**, *Nkrumah and the Chiefs: The Politics of Chieftaincy in Ghana 1951-60* (2000) · James Currey
- **Robert B. Edgerton**, *The Fall of the Asante Empire* (1995) · The Free Press
- **Robert Home**, *City of Blood Revisited: A New Look at the Benin Expedition of 1897* (1982) · Rex Collings
- **Robert Smith**, *The Lagos Consulate 1851-1861* (1978) · Macmillan
- **Roger S. Gocking**, *The History of Ghana* (2005) · Greenwood Press
- **Saburi O. Biobaku**, *The Egba and Their Neighbours 1842-1872* (1957) · Oxford University Press
- **Simon Schama**, *Rough Crossings: Britain, the Slaves and the American Revolution* (2005) · BBC Books
- **T.C. McCaskie**, *State and Society in Pre-colonial Asante* (1995) · Cambridge University Press
- **Thomas Pakenham**, *The Scramble for Africa 1876-1912* (1991) · Weidenfeld and Nicolson
- **Toyin Falola and Matthew M. Heaton**, *A History of Nigeria* (2008) · Cambridge University Press
- **Victor Julius Ngoh**, *History of Cameroon Since 1800* (1996) · Presbook
- **William A. Pettigrew**, *Freedom's Debt: The Royal African Company and the Politics of the Atlantic Slave Trade, 1672-1752* (2013) · University of North Carolina Press
- **William St Clair**, *The Grand Slave Emporium: Cape Coast Castle and the British Slave Trade* (2006) · Profile Books

### The South Atlantic, the Antarctic and the informal empire

_47 works, cited by `app/data/territories/atlantic-antarctic-outposts.json`._

- **Abdul Sheriff**, *Slaves, Spices and Ivory in Zanzibar: Integration of an East African Commercial Empire into the World Economy, 1770-1873* (1987) · James Currey
- **Allan B. Crawford**, *Tristan da Cunha and the Roaring Forties* (1982) · Charles Skilton
- **Andrew Pearson**, *Distant Freedom: St Helena and the Abolition of the Slave Trade, 1840-1872* (2016) · Liverpool University Press
- **Barry M. Gough**, *The Northwest Coast: British Navigation, Trade, and Discoveries to 1812* (1992) · University of British Columbia Press
- **Colin M. Lewis**, *British Railways in Argentina 1857-1914: A Case Study of Foreign Investment* (1983) · Athlone Press
- **D. C. M. Platt**, *Latin America and British Trade, 1806-1914* (1972) · Adam and Charles Black
- **Daniel Clayton**, *Islands of Truth: The Imperial Fashioning of Vancouver Island* (2000) · University of British Columbia Press
- **Daniel Yergin**, *The Prize: The Epic Quest for Oil, Money and Power* (1991) · Simon and Schuster
- **David Syrett**, *The Siege and Capture of Havana, 1762* (1970) · Navy Records Society · primary source
- **Donald Quataert**, *The Ottoman Empire, 1700-1922* (2005) · Cambridge University Press
- **Duff Hart-Davis**, *Ascension: The Story of a South Atlantic Island* (1972) · Constable
- **Elena A. Schneider**, *The Occupation of Havana: War, Trade, and Slavery in the Atlantic World* (2018) · University of North Carolina Press
- **Ervand Abrahamian**, *The Coup: 1953, the CIA, and the Roots of Modern U.S.-Iranian Relations* (2013) · The New Press
- **H. S. Ferns**, *Britain and Argentina in the Nineteenth Century* (1960) · Clarendon Press
- **Howard T. Fry**, *Alexander Dalrymple and the Expansion of British Trade* (1970) · Frank Cass
- **Ian Fletcher**, *The Waters of Oblivion: The British Invasion of the Rio de la Plata, 1806-1807* (1991) · Spellmount
- **John Lynch**, *The Spanish American Revolutions 1808-1826* (1973) · Weidenfeld and Nicolson
- **John Lynch**, *Argentine Dictator: Juan Manuel de Rosas 1829-1852* (1981) · Clarendon Press
- **Jonathan Kay Kamakawiwoole Osorio**, *Dismembering Lahui: A History of the Hawaiian Nation to 1887* (2002) · University of Hawaii Press
- **Juan R. I. Cole**, *Colonialism and Revolution in the Middle East: Social and Cultural Origins of Egypt's Urabi Movement* (1993) · Princeton University Press
- **Julius Goebel**, *The Struggle for the Falkland Islands: A Study in Legal and Diplomatic History* (1927) · Yale University Press
- **Klaus Dodds**, *Geopolitics in Antarctica: Views from the Southern Oceanic Rim* (1997) · John Wiley
- **Klaus Dodds**, *Pink Ice: Britain and the South Atlantic Empire* (2002) · I.B. Tauris
- **Klaus Gallo**, *Great Britain and Argentina: From Invasion to Recognition, 1806-26* (2001) · Palgrave
- **Lawrence Freedman**, *The Official History of the Falklands Campaign* (2005) · Routledge · official record
- **Lowell S. Gustafson**, *The Sovereignty Dispute over the Falkland (Malvinas) Islands* (1988) · Oxford University Press
- **Marius B. Jansen**, *The Making of Modern Japan* (2000) · Harvard University Press
- **Martin Middlebrook**, *The Argentine Fight for the Falklands* (1989) · Viking
- **Matthew Parker**, *Willoughbyland: England's Lost Colony* (2015) · Hutchinson
- **Michael R. Auslin**, *Negotiating with Imperialism: The Unequal Treaties and the Culture of Japanese Diplomacy* (2004) · Harvard University Press
- **Nicholas Tarling**, *Sulu and Sabah: A Study of British Policy towards the Philippines and North Borneo from the late Eighteenth Century* (1978) · Oxford University Press
- **Peter A. Munch**, *Crisis in Utopia: The Ordeal of Tristan da Cunha* (1971) · Longman
- **Peter J. Beck**, *The International Politics of Antarctica* (1986) · Croom Helm
- **Peter Winn**, *British Informal Empire in Uruguay in the Nineteenth Century* (1976) · Past and Present · article
- **Philip Gosse**, *St Helena 1502-1938* (1938) · Cassell
- **Ralph S. Kuykendall**, *The Hawaiian Kingdom, Volume 1: 1778-1854, Foundation and Transformation* (1938) · University of Hawaii Press
- **Richard Grove**, *Green Imperialism: Colonial Expansion, Tropical Island Edens and the Origins of Environmentalism, 1600-1860* (1995) · Cambridge University Press
- **Robert K. Headland**, *The Island of South Georgia* (1984) · Cambridge University Press
- **Robert K. Massie**, *Castles of Steel: Britain, Germany, and the Winning of the Great War at Sea* (2003) · Random House
- **Roland Huntford**, *Shackleton* (1985) · Hodder and Stoughton
- **Sevket Pamuk**, *The Ottoman Empire and European Capitalism, 1820-1913* (1987) · Cambridge University Press
- **Stephen A. Royle**, *The Company's Island: St Helena, Company Colonies and the Colonial Endeavour* (2007) · I.B. Tauris
- **Stephen Haddelsey**, *Operation Tabarin: Britain's Secret Wartime Expedition to Antarctica 1944-46* (2014) · The History Press
- **Tom Griffiths**, *Slicing the Silence: Voyaging to Antarctica* (2007) · University of New South Wales Press
- **W. G. Beasley**, *Great Britain and the Opening of Japan 1834-1858* (1951) · Luzac
- **Warren L. Cook**, *Flood Tide of Empire: Spain and the Pacific Northwest, 1543-1819* (1973) · Yale University Press
- **Wim Klooster**, *The Dutch Moment: War, Trade, and Settlement in the Seventeenth-Century Atlantic World* (2016) · Cornell University Press

### Australasia and the Pacific

_91 works, cited by `app/data/territories/australasia-pacific.json`._

- **Alan Powell**, *Far Country: A Short History of the Northern Territory* (1982) · Melbourne University Press
- **Anna Haebich**, *Broken Circles: Fragmenting Indigenous Families 1800-2000* (2000) · Fremantle Arts Centre Press
- **Anne Twomey**, *The Australia Acts 1986: Australia's Statutes of Independence* (2010) · Federation Press
- **Anthony J. Regan**, *Light Intervention: Lessons from Bougainville* (2010) · United States Institute of Peace Press
- **Antony Hooper**, *Tokelau: A Historical Ethnography* (1996) · Auckland University Press
- **Bain Attwood**, *Rights for Aborigines* (2003) · Allen & Unwin
- **Bain Attwood**, *The 1967 Referendum: Race, Power and the Australian Constitution* (2007) · Aboriginal Studies Press
- **Bain Attwood**, *Possession: Batman's Treaty and the Matter of History* (2009) · Miegunyah Press
- **Barrie Macdonald**, *Cinderellas of the Empire: Towards a History of Kiribati and Tuvalu* (1982) · Australian National University Press
- **Bill Gammage**, *The Sky Travellers: Journeys in New Guinea 1938-1939* (1998) · Miegunyah Press
- **Brij V. Lal**, *Girmitiyas: The Origins of the Fiji Indians* (1983) · Journal of Pacific History
- **Brij V. Lal**, *Broken Waves: A History of the Fiji Islands in the Twentieth Century* (1992) · University of Hawaii Press
- **Chris Owen**, *Every Mother's Son is Guilty: Policing the Kimberley Frontier of Western Australia 1882-1905* (2016) · UWA Publishing
- **Christopher Pugsley**, *Gallipoli: The New Zealand Story* (1984) · Hodder & Stoughton
- **Christopher Weeramantry**, *Nauru: Environmental Damage under International Trusteeship* (1992) · Oxford University Press
- **Claudia Orange**, *The Treaty of Waitangi* (1987) · Allen & Unwin
- **Clive Moore**, *Kanaka: A History of Melanesian Mackay* (1985) · Institute of Papua New Guinea Studies
- **Damon Salesa**, *Racial Crossings: Race, Intermarriage, and the Victorian British Empire* (2011) · Oxford University Press
- **Deryck Scarr**, *Fragments of Empire: A History of the Western Pacific High Commission 1877-1914* (1967) · Australian National University Press
- **Deryck Scarr**, *Fiji: A Short History* (1984) · Allen & Unwin
- **Dick Scott**, *Ask That Mountain: The Story of Parihaka* (1975) · Heinemann
- **Dick Scott**, *Years of the Pooh-Bah: A Cook Islands History* (1991) · Cook Islands Trading Corporation and Hodder & Stoughton
- **Donald Denoon**, *Getting Under the Skin: The Bougainville Copper Agreement and the Creation of the Panguna Mine* (2000) · Melbourne University Press
- **Donald Denoon**, *A Trial Separation: Australia and the Decolonisation of Papua New Guinea* (2005) · ANU E Press
- **Doug Munro**, *The Pacific Islands Labour Trade: Approaches, Methodologies, Debates* (1995) · Slavery and Abolition · article
- **Douglas Pike**, *Paradise of Dissent: South Australia 1829-1857* (1957) · Longmans
- **Geoffrey Blainey**, *The Rush That Never Ended: A History of Australian Mining* (1963) · Melbourne University Press
- **Grace Karskens**, *The Colony: A History of Early Sydney* (2009) · Allen & Unwin
- **Greg Dening**, *Mr Bligh's Bad Language: Passion, Power and Theatre on the Bounty* (1992) · Cambridge University Press
- **Hank Nelson**, *Taim Bilong Masta: The Australian Involvement with Papua New Guinea* (1982) · Australian Broadcasting Commission
- **Harry Maude**, *Of Islands and Men: Studies in Pacific History* (1968) · Oxford University Press
- **Hazel Riseborough**, *Days of Darkness: Taranaki 1878-1884* (1989) · Allen & Unwin
- **Helen Irving**, *To Constitute a Nation: A Cultural History of Australia's Constitution* (1997) · Cambridge University Press
- **Henry Reynolds**, *The Other Side of the Frontier: Aboriginal Resistance to the European Invasion of Australia* (1981) · James Cook University
- **Henry Reynolds**, *The Law of the Land* (1987) · Penguin
- **Henry Reynolds**, *Fate of a Free People* (1995) · Penguin
- **Henry Reynolds**, *Forgotten War* (2013) · NewSouth Publishing
- **Howard Van Trease**, *The Politics of Land in Vanuatu: From Colony to Independence* (1987) · Institute of Pacific Studies, University of the South Pacific
- **Hugh Laracy**, *Pacific Protest: The Maasina Rule Movement, Solomon Islands, 1944-1952* (1983) · Institute of Pacific Studies, University of the South Pacific
- **Human Rights and Equal Opportunity Commission**, *Bringing Them Home: Report of the National Inquiry into the Separation of Aboriginal and Torres Strait Islander Children from Their Families* (1997) · official record
- **I.C. Campbell**, *Island Kingdom: Tonga Ancient and Modern* (1992) · Canterbury University Press
- **Ian Campbell**, *A History of the Pacific Islands* (1989) · Canterbury University Press
- **Ian D. Clark**, *Scars in the Landscape: A Register of Massacre Sites in Western Victoria 1803-1859* (1995) · Aboriginal Studies Press
- **James Belich**, *The New Zealand Wars and the Victorian Interpretation of Racial Conflict* (1986) · Auckland University Press
- **John Connor**, *The Australian Frontier Wars 1788-1838* (2002) · University of New South Wales Press
- **John Molony**, *Eureka* (1984) · Viking
- **Joseph H. Alexander**, *Utmost Savagery: The Three Days of Tarawa* (1995) · Naval Institute Press
- **Judith A. Bennett**, *Wealth of the Solomons: A History of a Pacific Archipelago, 1800-1978* (1987) · University of Hawaii Press
- **Judith Binney**, *Redemption Songs: A Life of Te Kooti Arikirangi Te Turuki* (1995) · Auckland University Press
- **Katerina Martina Teaiwa**, *Consuming Ocean Island: Stories of People and Phosphate from Banaba* (2015) · Indiana University Press
- **Kathy Marks**, *Lost Paradise: From Mutiny on the Bounty to a Modern-Day Legacy of Sexual Mayhem* (2008) · Free Press
- **Les Carlyon**, *Gallipoli* (2001) · Macmillan
- **Lyndall Ryan**, *Tasmanian Aborigines: A History Since 1803* (2012) · Allen & Unwin
- **Malama Meleisea**, *The Making of Modern Samoa: Traditional Authority and Colonial Administration in the History of Western Samoa* (1987) · Institute of Pacific Studies, University of the South Pacific
- **Maria Nugent**, *Captain Cook Was Here* (2009) · Cambridge University Press
- **Marilyn Lake**, *Drawing the Global Colour Line: White Men's Countries and the International Challenge of Racial Equality* (2008) · Cambridge University Press
- **Mark Tedeschi**, *Murder at Myall Creek: The Trial that Defined a Nation* (2016) · Simon & Schuster
- **Merval Hoare**, *Norfolk Island: A Revised and Enlarged History 1774-1998* (1999) · Central Queensland University Press
- **Michael Field**, *Mau: Samoa's Struggle Against New Zealand Oppression* (1984) · A.H. & A.W. Reed
- **Michael King**, *The Penguin History of New Zealand* (2003) · Penguin
- **Nancy Viviani**, *Nauru: Phosphate and Political Progress* (1970) · Australian National University Press
- **Natasha Stacey**, *Boats to Burn: Bajo Fishing Activity in the Australian Fishing Zone* (2007) · ANU E Press
- **Neville Green**, *Broken Spears: Aborigines and Europeans in the Southwest of Australia* (1984) · Focus Education Services
- **Nicholas Clements**, *The Black War: Fear, Sex and Resistance in Tasmania* (2014) · University of Queensland Press
- **Nicholas Thomas**, *Discoveries: The Voyages of Captain Cook* (2003) · Allen Lane
- **Noel Loos**, *Invasion and Resistance: Aboriginal-European Relations on the North Queensland Frontier 1861-1897* (1982) · Australian National University Press
- **Noel Loos**, *Edward Koiki Mabo: His Life and Struggle for Land Rights* (1996) · University of Queensland Press
- **Paul Kennedy**, *The Samoan Tangle: A Study in Anglo-German-American Relations 1878-1900* (1974) · Irish University Press
- **Peter Read**, *The Stolen Generations: The Removal of Aboriginal Children in New South Wales 1883 to 1969* (1981) · New South Wales Ministry of Aboriginal Affairs
- **Peter Read**, *Long Time, Olden Time: Aboriginal Accounts of Northern Territory History* (1991) · Institute for Aboriginal Development
- **Ranginui Walker**, *Ka Whawhai Tonu Matou: Struggle Without End* (1990) · Penguin
- **Raymond Evans**, *A History of Queensland* (2007) · Cambridge University Press
- **Robert Foster**, *Fatal Collisions: The South Australian Frontier and the Violence of Memory* (2001) · Wakefield Press
- **Robert Hughes**, *The Fatal Shore: A History of the Transportation of Convicts to Australia, 1787-1868* (1986) · Collins Harvill
- **Robert W. Kirk**, *Pitcairn Island, the Bounty Mutineers and Their Descendants: A History* (2008) · McFarland
- **Roger M. Keesing**, *Lightning Meets the West Wind: The Malaita Massacre* (1980) · Oxford University Press
- **Roger Milliss**, *Waterloo Creek: The Australia Day Massacre of 1838, George Gipps and the British Conquest of New South Wales* (1992) · McPhee Gribble
- **Sione Lātūkefu**, *Church and State in Tonga: The Wesleyan Methodist Missionaries and Political Development, 1822-1875* (1974) · Australian National University Press
- **Stewart Firth**, *New Guinea under the Germans* (1982) · Melbourne University Press
- **Stuart Kaye**, *Australia's Maritime Boundaries* (2001) · Centre for Maritime Policy, University of Wollongong
- **Stuart Macintyre**, *A Concise History of Australia* (1999) · Cambridge University Press
- **Terry Chapman**, *Niue: A History of the Island* (1982) · Institute of Pacific Studies, University of the South Pacific
- **Timothy Bottoms**, *Conspiracy of Silence: Queensland's Frontier Killing Times* (2013) · Allen & Unwin
- **Tony Roberts**, *Frontier Justice: A History of the Gulf Country to 1900* (2005) · University of Queensland Press
- **Totaram Sanadhya**, *My Twenty-One Years in the Fiji Islands* (1914) · primary source
- **Tracey Banivanua Mar**, *Violence and Colonial Dialogue: The Australian-Pacific Indentured Labor Trade* (2007) · University of Hawaii Press
- **Vincent O'Malley**, *The Great War for New Zealand: Waikato 1800-2000* (2016) · Bridget Williams Books
- **W. David McIntyre**, *The Imperial Frontier in the Tropics 1865-75* (1967) · Macmillan
- **W. David McIntyre**, *Dominion of New Zealand: Statesmen and Status 1907-1945* (2007) · New Zealand Institute of International Affairs
- **W. David McIntyre**, *Winding Up the British Empire in the Pacific Islands* (2014) · Oxford University Press
- **Waitangi Tribunal**, *He Whakaputanga me te Tiriti / The Declaration and the Treaty: Report on Stage 1 of the Te Paparahi o Te Raki Inquiry* (2014) · official record

### The British Isles, the Mediterranean and Europe

_58 works, cited by `app/data/territories/british-isles-europe.json`._

- **Alvin Jackson**, *Ireland 1798-1998: Politics and War* (1999) · Blackwell
- **Alvin Jackson**, *Home Rule: An Irish History 1800-2000* (2003) · Weidenfeld and Nicolson
- **Andrekos Varnava**, *British Imperialism in Cyprus, 1878-1915: The Inconsequential Possession* (2009) · Manchester University Press
- **Antonio Jose Telo**, *Portugal na Segunda Guerra (1941-1945)* (1991) · Vega
- **Brendan Simms**, *Three Victories and a Defeat: The Rise and Fall of the First British Empire* (2007) · Allen Lane
- **Brian Blouet**, *The Story of Malta* (1967) · Faber and Faber
- **Brian Tunstall**, *Admiral Byng and the Loss of Minorca* (1928) · Philip Allan
- **Charles Townshend**, *Easter 1916: The Irish Rebellion* (2005) · Allen Lane
- **Charles Townshend**, *The Republic: The Fight for Irish Independence, 1918-1923* (2013) · Allen Lane
- **Chris Grocott and Gareth Stockey**, *Gibraltar: A Modern History* (2012) · University of Wales Press
- **Christine Kinealy**, *This Great Calamity: The Irish Famine 1845-52* (1994) · Gill and Macmillan
- **Christopher A. Whatley**, *The Scots and the Union* (2006) · Edinburgh University Press
- **Christopher Knowles**, *Winning the Peace: The British in Occupied Germany, 1945-1948* (2017) · Bloomsbury Academic
- **Cormac O Grada**, *Black '47 and Beyond: The Great Irish Famine in History, Economy, and Memory* (1999) · Princeton University Press
- **David French**, *Fighting EOKA: The British Counter-Insurgency Campaign on Cyprus, 1955-1959* (2015) · Oxford University Press
- **David McKittrick and David McVea**, *Making Sense of the Troubles* (2000) · Blackstaff Press
- **David McKittrick, Seamus Kelters, Brian Feeney and Chris Thornton**, *Lost Lives: The Stories of the Men, Women and Children who Died as a Result of the Northern Ireland Troubles* (1999) · Mainstream Publishing
- **Desmond Gregory**, *The Ungovernable Rock: A History of the Anglo-Corsican Kingdom and its Role in Britain's Mediterranean Strategy During the Revolutionary War, 1793-1797* (1985) · Associated University Presses
- **Desmond Gregory**, *The Beneficent Usurpers: A History of the British in Madeira* (1988) · Associated University Presses
- **Desmond Gregory**, *Minorca, the Illusory Prize: A History of the British Occupations of Minorca between 1708 and 1802* (1990) · Associated University Presses
- **Diarmaid Ferriter**, *The Transformation of Ireland 1900-2000* (2004) · Profile Books
- **Donald F. Bittner**, *The Lion and the White Falcon: Britain and Iceland in the World War II Era* (1983) · Archon Books
- **E. M. G. Routh**, *Tangier: England's Lost Atlantic Outpost, 1661-1684* (1912) · John Murray
- **Ernle Bradford**, *Siege: Malta 1940-1943* (1985) · Hamish Hamilton
- **Gunnar Karlsson**, *The History of Iceland* (2000) · University of Minnesota Press
- **Henry Frendo**, *Party Politics in a Fortress Colony: The Maltese Experience* (1979) · Midsea Books
- **Hugh Thomas**, *The Slave Trade: The History of the Atlantic Slave Trade 1440-1870* (1997) · Picador
- **Ian D. Turner**, *Reconstruction in Post-War Germany: British Occupation Policy and the Western Zones, 1945-55* (1989) · Berg
- **James Fisher**, *Rockall* (1956) · Geoffrey Bles
- **Jan Ruger**, *Heligoland: Britain, Germany, and the Struggle for the North Sea* (2017) · Oxford University Press
- **John Belchem**, *A New History of the Isle of Man, Volume V: The Modern Period 1830-1999* (2000) · Liverpool University Press
- **John Le Patourel**, *The Medieval Administration of the Channel Islands, 1199-1399* (1937) · Oxford University Press
- **Jonathan Bardon**, *A History of Ulster* (1992) · Blackstaff Press
- **Jonathan Wylie**, *The Faroe Islands: Interpretations of History* (1987) · University Press of Kentucky
- **Madeleine Bunting**, *The Model Occupation: The Channel Islands under German Rule, 1940-1945* (1995) · HarperCollins
- **Marianne Elliott**, *Wolfe Tone: Prophet of Irish Independence* (1989) · Yale University Press
- **Michael Hopkinson**, *Green Against Green: The Irish Civil War* (1988) · Gill and Macmillan
- **Micheal O Siochru**, *God's Executioner: Oliver Cromwell and the Conquest of Ireland* (2008) · Faber and Faber
- **N. A. M. Rodger**, *The Command of the Ocean: A Naval History of Britain, 1649-1815* (2004) · Allen Lane
- **Nicholas Canny**, *Making Ireland British, 1580-1650* (2001) · Oxford University Press
- **Nick Harding**, *Hanover and the British Empire, 1700-1837* (2007) · Boydell Press
- **Padraig Lenihan**, *1690: Battle of the Boyne* (2003) · Tempus
- **Paul Bew**, *Land and the National Question in Ireland, 1858-82* (1978) · Gill and Macmillan
- **Paul Bew**, *Ireland: The Politics of Enmity 1789-2006* (2007) · Oxford University Press
- **Paul Sanders**, *The British Channel Islands under German Occupation, 1940-1945* (2005) · Jersey Heritage Trust
- **R. F. Foster**, *Modern Ireland 1600-1972* (1988) · Allen Lane
- **R. H. Kinvig**, *The Isle of Man: A Social, Cultural and Political History* (1975) · Liverpool University Press
- **Richard Overy**, *Why the Allies Won* (1995) · Jonathan Cape
- **Robert Holland**, *Britain and the Revolt in Cyprus, 1954-1959* (1998) · Oxford University Press
- **Robert Holland and Diana Markides**, *The British and the Hellenes: Struggles for Mastery in the Eastern Mediterranean 1850-1960* (2006) · Oxford University Press
- **Ronald Hutton**, *Charles II: King of England, Scotland, and Ireland* (1989) · Oxford University Press
- **Rory Muir**, *Britain and the Defeat of Napoleon, 1807-1815* (1996) · Yale University Press
- **Roy Adkins and Lesley Adkins**, *Gibraltar: The Greatest Siege in British History* (2017) · Little, Brown
- **Stephen Constantine**, *Community and Identity: The Making of Modern Gibraltar since 1704* (2009) · Manchester University Press
- **T. M. Devine**, *Scotland's Empire, 1600-1815* (2003) · Allen Lane
- **Thomas Bartlett**, *Ireland: A History* (2010) · Cambridge University Press
- **Thomas W. Gallant**, *Experiencing Dominion: Culture, Identity, and Power in the British Mediterranean* (2002) · University of Notre Dame Press
- **United Kingdom Parliament**, *Island of Rockall Act 1972* (1972) · official record

### The Caribbean and the tropical American mainland

_68 works, cited by `app/data/territories/caribbean.json`._

- **Andrew Jackson O'Shaughnessy**, *An Empire Divided: The American Revolution and the British Caribbean* (2000) · University of Pennsylvania Press
- **Assad Shoman**, *Thirteen Chapters of a History of Belize* (1994) · Angelus Press
- **B. W. Higman**, *A Concise History of the Caribbean* (2011) · Cambridge University Press
- **Beverley A. Steele**, *Grenada: A History of Its People* (2003) · Macmillan Caribbean
- **Bridget Brereton**, *A History of Modern Trinidad 1783-1962* (1981) · Heinemann
- **Carla Gardina Pestana**, *The English Conquest of Jamaica: Oliver Cromwell's Bid for Empire* (2017) · Harvard University Press
- **Catherine Hall**, *Civilising Subjects: Metropole and Colony in the English Imagination 1830-1867* (2002) · Polity Press
- **Catherine Hall, Nicholas Draper, Keith McClelland, Katie Donington and Rachel Lang**, *Legacies of British Slave-ownership: Colonial Slavery and the Formation of Victorian Britain* (2014) · Cambridge University Press
- **Christopher Leslie Brown**, *Moral Capital: Foundations of British Abolitionism* (2006) · University of North Carolina Press
- **Christopher Taylor**, *The Black Carib Wars: Freedom, Survival, and the Making of the Garifuna* (2012) · University Press of Mississippi
- **Colin A. Palmer**, *Cheddi Jagan and the Politics of Power: British Guiana's Struggle for Independence* (2010) · University of North Carolina Press
- **Colin Woodard**, *The Republic of Pirates* (2007) · Harcourt
- **Cornelis Ch. Goslinga**, *The Dutch in the Caribbean and in Surinam, 1791-1942* (1990) · Van Gorcum
- **David Barry Gaspar**, *Bondmen and Rebels: A Study of Master-Slave Relations in Antigua* (1985) · Johns Hopkins University Press
- **David Barry Gaspar and David Patrick Geggus**, *A Turbulent Time: The French Revolution and the Greater Caribbean* (1997) · Indiana University Press
- **David Lowenthal and Colin G. Clarke**, *Slave-Breeding in Barbuda: The Past of a Negro Myth* (1977) · Annals of the New York Academy of Sciences · article
- **David Patrick Geggus**, *Slavery, War and Revolution: The British Occupation of Saint Domingue, 1793-1798* (1982) · Clarendon Press
- **Donald E. Westlake**, *Under an English Heaven* (1972) · Simon and Schuster
- **Donald Harman Akenson**, *If the Irish Ran the World: Montserrat, 1630-1730* (1997) · McGill-Queen's University Press
- **Donald Wood**, *Trinidad in Transition: The Years After Slavery* (1968) · Oxford University Press
- **Edward L. Cox**, *Free Coloreds in the Slave Societies of St. Kitts and Grenada, 1763-1833* (1984) · University of Tennessee Press
- **Elena A. Schneider**, *The Occupation of Havana: War, Trade, and Slavery in the Atlantic World* (2018) · University of North Carolina Press
- **Emilia Viotti da Costa**, *Crowns of Glory, Tears of Blood: The Demerara Slave Rebellion of 1823* (1994) · Oxford University Press
- **Eric Williams**, *Capitalism and Slavery* (1944) · University of North Carolina Press
- **Fred Anderson**, *Crucible of War: The Seven Years' War and the Fate of Empire in British North America, 1754-1766* (2000) · Alfred A. Knopf
- **Gad Heuman**, *The Killing Time: The Morant Bay Rebellion in Jamaica* (1994) · Macmillan Caribbean
- **Hilary McD. Beckles**, *Bussa: The 1816 Revolution in Barbados* (1998) · University of the West Indies, Department of History
- **Hilary McD. Beckles**, *A History of Barbados: From Amerindian Settlement to Caribbean Single Market* (2006) · Cambridge University Press
- **Howard A. Fergus**, *Montserrat: History of a Caribbean Colony* (1994) · Macmillan Caribbean
- **Hugh Tinker**, *A New System of Slavery: The Export of Indian Labour Overseas, 1830-1920* (1974) · Oxford University Press
- **Isaac Dookhan**, *A History of the British Virgin Islands, 1672 to 1970* (1975) · Caribbean Universities Press
- **James Williams**, *A Narrative of Events since the First of August 1834, by James Williams, an Apprenticed Labourer in Jamaica* (1837) · primary source
- **John Mordecai**, *The West Indies: The Federal Negotiations* (1968) · George Allen and Unwin
- **Jolien Harmsen, Guy Ellis and Robert Devaux**, *A History of St Lucia* (2012) · Lighthouse Road
- **K. O. Laurence**, *A Question of Labour: Indentured Immigration into Trinidad and British Guiana, 1875-1917* (1994) · Ian Randle Publishers
- **Laurent Dubois**, *Avengers of the New World: The Story of the Haitian Revolution* (2004) · Harvard University Press
- **Laurent Dubois**, *A Colony of Citizens: Revolution and Slave Emancipation in the French Caribbean, 1787-1804* (2004) · University of North Carolina Press
- **Lennox Honychurch**, *The Dominica Story: A History of the Island* (1995) · Macmillan Caribbean
- **Lennox Honychurch**, *In the Forests of Freedom: The Fighting Maroons of Dominica* (2019) · University Press of Mississippi
- **Marjoleine Kars**, *Blood on the River: A Chronicle of Mutiny and Freedom on the Wild Coast* (2020) · The New Press
- **Mary Reckord**, *The Jamaica Slave Rebellion of 1831* (1968) · Past and Present · article
- **Matthew Parker**, *Willoughbyland: England's Lost Colony* (2015) · Hutchinson
- **Mavis C. Campbell**, *The Maroons of Jamaica 1655-1796: A History of Resistance, Collaboration and Betrayal* (1988) · Bergin and Garvey
- **Michael Craton**, *Testing the Chains: Resistance to Slavery in the British West Indies* (1982) · Cornell University Press
- **Michael Craton**, *Founded upon the Seas: A History of the Cayman Islands and Their People* (2003) · Ian Randle Publishers
- **Michael Craton and Gail Saunders**, *Islanders in the Stream: A History of the Bahamian People* (1992) · University of Georgia Press
- **Michael D. Olien**, *The Miskito Kings and the Line of Succession* (1983) · Journal of Anthropological Research · article
- **Michael Duffy**, *Soldiers, Sugar, and Seapower: The British Expeditions to the West Indies and the War against Revolutionary France* (1987) · Clarendon Press
- **Michael J. Jarvis**, *In the Eye of All Trade: Bermuda, Bermudians, and the Maritime Atlantic World, 1680-1783* (2010) · University of North Carolina Press
- **Nancie L. González**, *Sojourners of the Caribbean: Ethnogenesis and Ethnohistory of the Garifuna* (1988) · University of Illinois Press
- **Neville A. T. Hall**, *Slave Society in the Danish West Indies: St Thomas, St John and St Croix* (1992) · University of the West Indies Press
- **Nicholas Draper**, *The Price of Emancipation: Slave-ownership, Compensation and British Society at the End of Slavery* (2010) · Cambridge University Press
- **O. Nigel Bolland**, *The Formation of a Colonial Society: Belize, from Conquest to Crown Colony* (1977) · Johns Hopkins University Press
- **O. Nigel Bolland**, *The Politics of Labour in the British Caribbean: The Social Origins of Authoritarianism and Democracy in the Labour Movement* (2001) · Ian Randle Publishers
- **Richard Hart**, *Labour Rebellions of the 1930s in the British Caribbean Region Colonies* (2002) · Socialist History Society and Caribbean Labour Solidarity
- **Richard Price**, *First-Time: The Historical Vision of an African American People* (1983) · Johns Hopkins University Press
- **Richard S. Dunn**, *Sugar and Slaves: The Rise of the Planter Class in the English West Indies, 1624-1713* (1972) · University of North Carolina Press
- **Riva Berleant-Schiller**, *The Black Barbudans* (1977) · article
- **Robert A. Naylor**, *Penny Ante Imperialism: The Mosquito Shore and the Bay of Honduras, 1600-1914* (1989) · Fairleigh Dickinson University Press
- **Ronald Hurst**, *The Golden Rock: An Episode of the American War of Independence, 1775-1783* (1996) · Leo Cooper
- **Susan E. Craig-James**, *The Changing Society of Tobago 1838-1938: A Fractured Whole* (2008) · Cornerstone Press
- **Thomas C. Holt**, *The Problem of Freedom: Race, Labor, and Politics in Jamaica and Britain, 1832-1938* (1992) · Johns Hopkins University Press
- **Trevor Burnard**, *Mastery, Tyranny, and Desire: Thomas Thistlewood and His Slaves in the Anglo-Jamaican World* (2004) · University of North Carolina Press
- **Vincent Brown**, *Tacky's Revolt: The Story of an Atlantic Slave War* (2020) · Harvard University Press
- **Vincent K. Hubbard**, *Swords, Ships and Sugar: History of Nevis* (2002) · Premiere Editions
- **Walter Rodney**, *A History of the Guyanese Working People, 1881-1905* (1981) · Johns Hopkins University Press
- **William V. Davidson**, *Historical Geography of the Bay Islands, Honduras* (1974) · Southern University Press
- **Wim Klooster**, *Illicit Riches: Dutch Trade in the Caribbean, 1648-1795* (1998) · KITLV Press

### The Middle East, the Gulf and the Indian Ocean

_52 works, cited by `app/data/territories/middle-east-indian-ocean.json`._

- **A. L. Macfie**, *The End of the Ottoman Empire, 1908-1923* (1998) · Longman
- **Abdel Razzaq Takriti**, *Monsoon Revolution: Republicans, Sultans, and Empires in Oman, 1965-1976* (2013) · Oxford University Press
- **Auguste Toussaint**, *History of Mauritius* (1977) · Macmillan
- **Benny Morris**, *The Birth of the Palestinian Refugee Problem Revisited* (2004) · Cambridge University Press
- **C. M. Turnbull**, *A History of Singapore, 1819-1975* (1977) · Oxford University Press
- **Charles Tripp**, *A History of Iraq* (2007) · Cambridge University Press
- **Clarence Maloney**, *People of the Maldive Islands* (1980) · Orient Longman
- **David Fromkin**, *A Peace to End All Peace: The Fall of the Ottoman Empire and the Creation of the Modern Middle East* (1989) · Henry Holt
- **David Vine**, *Island of Shame: The Secret History of the U.S. Military Base on Diego Garcia* (2009) · Princeton University Press
- **Deryck Scarr**, *Seychelles Since 1770: History of a Slave and Post-Slavery Society* (2000) · C. Hurst
- **Elizabeth Monroe**, *Britain's Moment in the Middle East, 1914-1971* (1981) · Chatto & Windus
- **Ervand Abrahamian**, *The Coup: 1953, the CIA, and the Roots of Modern U.S.-Iranian Relations* (2013) · The New Press
- **Eugene Rogan**, *The Fall of the Ottomans: The Great War in the Middle East* (2015) · Allen Lane
- **Frauke Heard-Bey**, *From Trucial States to United Arab Emirates* (1982) · Longman
- **Gary Troeller**, *The Birth of Saudi Arabia: Britain and the Rise of the House of Sa'ud* (1976) · Frank Cass
- **Glen Balfour-Paul**, *The End of Empire in the Middle East: Britain's Relinquishment of Power in her Last Three Arab Dependencies* (1991) · Cambridge University Press
- **Harold Ingrams**, *Arabia and the Isles* (1942) · John Murray · primary source
- **J. B. Kelly**, *Britain and the Persian Gulf, 1795-1880* (1968) · Oxford University Press
- **J. E. Peterson**, *Oman in the Twentieth Century: Political Foundations of an Emerging State* (1978) · Croom Helm
- **J. E. Peterson**, *Oman's Insurgencies: The Sultanate's Struggle for Supremacy* (2007) · Saqi Books
- **J. J. Robinson**, *The Maldives: Islamic Republic, Tropical Autocracy* (2015) · C. Hurst
- **James Barr**, *A Line in the Sand: Britain, France and the Struggle that Shaped the Middle East* (2011) · Simon & Schuster
- **James Onley**, *The Arabian Frontier of the British Raj: Merchants, Rulers, and the British in the Nineteenth-Century Gulf* (2007) · Oxford University Press
- **Jill Crystal**, *Oil and Politics in the Gulf: Rulers and Merchants in Kuwait and Qatar* (1990) · Cambridge University Press
- **John Darwin**, *Britain, Egypt and the Middle East: Imperial Policy in the Aftermath of War 1918-1922* (1981) · Macmillan
- **Jonathan Walker**, *Aden Insurgency: The Savage War in South Arabia 1962-1967* (2005) · Spellmount
- **Madawi Al-Rasheed**, *A History of Saudi Arabia* (2002) · Cambridge University Press
- **Marina Carter**, *Servants, Sirdars and Settlers: Indians in Mauritius, 1834-1874* (1995) · Oxford University Press
- **Mary C. Wilson**, *King Abdullah, Britain and the Making of Jordan* (1987) · Cambridge University Press
- **Matthew Hughes**, *Britain's Pacification of Palestine: The British Army, the Colonial State, and the Arab Revolt, 1936-1939* (2019) · Cambridge University Press
- **Michael Christopher Low**, *Imperial Mecca: Ottoman Arabia and the Indian Ocean Hajj* (2020) · Columbia University Press
- **Miranda Morris**, *The Soqotri Language: Volume I, Texts* (2019) · Brill · reference work
- **Nelida Fuccaro**, *Histories of City and State in the Persian Gulf: Manama since 1800* (2009) · Cambridge University Press
- **Nigel Ashton**, *King Hussein of Jordan: A Political Life* (2008) · Yale University Press
- **Nikki R. Keddie**, *Modern Iran: Roots and Results of Revolution* (2006) · Yale University Press
- **Nur Bilge Criss**, *Istanbul under Allied Occupation, 1918-1923* (1999) · Brill
- **Peter Sluglett**, *Britain in Iraq: Contriving King and Country* (2007) · I.B. Tauris
- **Philippe Sands**, *The Last Colony: A Tale of Exile, Justice and Britain's Colonial Legacy* (2022) · Weidenfeld & Nicolson
- **R. J. Gavin**, *Aden Under British Rule, 1839-1967* (1975) · C. Hurst
- **Rashid Khalidi**, *The Iron Cage: The Story of the Palestinian Struggle for Statehood* (2006) · Beacon Press
- **Richard B. Allen**, *Slaves, Freedmen and Indentured Laborers in Colonial Mauritius* (1999) · Cambridge University Press
- **Robert Aldrich**, *The Last Colonies* (1998) · Cambridge University Press
- **Robert J. Blyth**, *The Empire of the Raj: India, Eastern Africa and the Middle East, 1858-1947* (2003) · Palgrave Macmillan
- **Rosemarie Said Zahlan**, *The Creation of Qatar* (1979) · Croom Helm
- **Simon C. Smith**, *Britain's Revival and Fall in the Gulf: Kuwait, Bahrain, Qatar, and the Trucial States, 1950-71* (2004) · RoutledgeCurzon
- **Spencer Mawby**, *British Policy in Aden and the Protectorates 1955-67: Last Outpost of a Middle East Empire* (2005) · Routledge
- **Stephen Allen**, *The Chagos Islanders and International Law* (2014) · Hart Publishing
- **Sultan Muhammad Al-Qasimi**, *The Myth of Arab Piracy in the Gulf* (1986) · Croom Helm
- **Toby Dodge**, *Inventing Iraq: The Failure of Nation Building and a History Denied* (2003) · Columbia University Press
- **Tom Segev**, *One Palestine, Complete: Jews and Arabs under the British Mandate* (2000) · Little, Brown
- **Vijaya Teelock**, *Mauritian History: From Its Beginnings to Modern Times* (2001) · Mahatma Gandhi Institute
- **Wm. Roger Louis**, *The British Empire in the Middle East, 1945-1951: Arab Nationalism, the United States, and Postwar Imperialism* (1984) · Oxford University Press

### North America and the Canadian North

_70 works, cited by `app/data/territories/north-america.json`._

- **Alan Gallay**, *The Indian Slave Trade: The Rise of the English Empire in the American South, 1670-1717* (2002) · Yale University Press
- **Alan Taylor**, *American Colonies: The Settling of North America* (2001) · Viking
- **Alan Taylor**, *The Divided Ground: Indians, Settlers, and the Northern Borderland of the American Revolution* (2006) · Alfred A. Knopf
- **Alan Taylor**, *The Civil War of 1812: American Citizens, British Subjects, Irish Rebels, and Indian Allies* (2010) · Alfred A. Knopf
- **Alfred A. Cave**, *The Pequot War* (1996) · University of Massachusetts Press
- **Allan Greer**, *The Patriots and the People: The Rebellion of 1837 in Rural Lower Canada* (1993) · University of Toronto Press
- **Ann Gorman Condon**, *The Envy of the American States: The Loyalist Dream for New Brunswick* (1984) · New Ireland Press
- **Ann M. Carlos**, *Commerce by a Frozen Sea: Native Americans and the European Fur Trade* (2010) · University of Pennsylvania Press
- **Arthur J. Ray**, *Indians in the Fur Trade* (1974) · University of Toronto Press
- **Bernard Bailyn**, *The Ideological Origins of the American Revolution* (1967) · Harvard University Press
- **Betty Wood**, *Slavery in Colonial Georgia, 1730-1775* (1984) · University of Georgia Press
- **Blair Stonechild**, *Loyal till Death: Indians and the North-West Rebellion* (1997) · Fifth House
- **Cassandra Pybus**, *Epic Journeys of Freedom: Runaway Slaves of the American Revolution and their Global Quest for Liberty* (2006) · Beacon Press
- **Charles Loch Mowat**, *East Florida as a British Province, 1763-1784* (1943) · University of California Press
- **Cole Harris**, *The Resettlement of British Columbia: Essays on Colonialism and Geographical Change* (1997) · University of British Columbia Press
- **Colin G. Calloway**, *The American Revolution in Indian Country: Crisis and Diversity in Native American Communities* (1995) · Cambridge University Press
- **Colin G. Calloway**, *The Scratch of a Pen: 1763 and the Transformation of North America* (2006) · Oxford University Press
- **Daniel K. Richter**, *Facing East from Indian Country: A Native History of Early America* (2001) · Harvard University Press
- **Edmund S. Morgan**, *The Stamp Act Crisis: Prologue to Revolution* (1953) · University of North Carolina Press
- **Edmund S. Morgan**, *American Slavery, American Freedom: The Ordeal of Colonial Virginia* (1975) · W. W. Norton
- **Fred Anderson**, *Crucible of War: The Seven Years' War and the Fate of Empire in British North America, 1754-1766* (2000) · Alfred A. Knopf
- **Frederick Merk**, *The Oregon Question: Essays in Anglo-American Diplomacy and Politics* (1967) · Harvard University Press
- **Gary B. Nash**, *Quakers and Politics: Pennsylvania, 1681-1726* (1968) · Princeton University Press
- **Ged Martin**, *The Durham Report and British Policy: A Critical Essay* (1972) · Cambridge University Press
- **Geoffrey Plank**, *An Unsettled Conquest: The British Campaign Against the Peoples of Acadia* (2001) · University of Pennsylvania Press
- **George F. G. Stanley**, *The Birth of Western Canada: A History of the Riel Rebellions* (1936) · Longmans, Green
- **Gerald Friesen**, *The Canadian Prairies: A History* (1984) · University of Toronto Press
- **Gregory Evans Dowd**, *War under Heaven: Pontiac, the Indian Nations, and the British Empire* (2002) · Johns Hopkins University Press
- **Hilda Neatby**, *Quebec: The Revolutionary Age, 1760-1791* (1966) · McClelland and Stewart
- **J. M. Bumsted**, *Land, Settlement, and Politics on Eighteenth-Century Prince Edward Island* (1987) · McGill-Queen's University Press
- **J. M. Bumsted**, *The Red River Rebellion* (1996) · Watson and Dwyer
- **J. R. Miller**, *Compact, Contract, Covenant: Aboriginal Treaty-Making in Canada* (2009) · University of Toronto Press
- **James Daschuk**, *Clearing the Plains: Disease, Politics of Starvation, and the Loss of Aboriginal Life* (2013) · University of Regina Press
- **Jay Coughtry**, *The Notorious Triangle: Rhode Island and the African Slave Trade, 1700-1807* (1981) · Temple University Press
- **Jean Barman**, *The West Beyond the West: A History of British Columbia* (1991) · University of Toronto Press
- **Jere R. Daniell**, *Colonial New Hampshire: A History* (1981) · KTO Press
- **Jerry Bannister**, *The Rule of the Admirals: Law, Custom, and Naval Government in Newfoundland, 1699-1832* (2003) · University of Toronto Press
- **Jill Lepore**, *The Name of War: King Philip's War and the Origins of American Identity* (1998) · Alfred A. Knopf
- **John A. Munroe**, *Colonial Delaware: A History* (1978) · KTO Press
- **John E. Pomfret**, *Colonial New Jersey: A History* (1973) · Charles Scribner's Sons
- **John Mack Faragher**, *A Great and Noble Scheme: The Tragic Story of the Expulsion of the French Acadians from their American Homeland* (2005) · W. W. Norton
- **Karen Ordahl Kupperman**, *The Jamestown Project* (2007) · Harvard University Press
- **Kathleen DuVal**, *Independence Lost: Lives on the Edge of the American Revolution* (2015) · Random House
- **Kenneth Coates**, *Land of the Midnight Sun: A History of the Yukon* (1988) · Hurtig
- **Kenneth Coleman**, *Colonial Georgia: A History* (1976) · Charles Scribner's Sons
- **Margaret Conrad**, *A Concise History of Canada* (2012) · Cambridge University Press
- **Maya Jasanoff**, *Liberty's Exiles: American Loyalists in the Revolutionary World* (2011) · Alfred A. Knopf
- **Michael J. Jarvis**, *In the Eye of All Trade: Bermuda, Bermudians, and the Maritime Atlantic World, 1680-1783* (2010) · University of North Carolina Press
- **Morris Zaslow**, *The Opening of the Canadian North, 1870-1914* (1971) · McClelland and Stewart
- **Naomi E. S. Griffiths**, *From Migrant to Acadian: A North American Border People, 1604-1755* (2005) · McGill-Queen's University Press
- **Norman Penlington**, *The Alaska Boundary Dispute: A Critical Reappraisal* (1972) · McGraw-Hill Ryerson
- **P. B. Waite**, *The Life and Times of Confederation, 1864-1867* (1962) · University of Toronto Press
- **Peter H. Wood**, *Black Majority: Negroes in Colonial South Carolina from 1670 through the Stono Rebellion* (1974) · Alfred A. Knopf
- **Peter Neary**, *Newfoundland in the North Atlantic World, 1929-1949* (1988) · McGill-Queen's University Press
- **Philip D. Morgan**, *Slave Counterpoint: Black Culture in the Eighteenth-Century Chesapeake and Lowcountry* (1998) · University of North Carolina Press
- **Phillip Buckner**, *Canada and the British Empire* (2008) · Oxford University Press
- **Piers Mackesy**, *The War for America, 1775-1783* (1964) · Harvard University Press
- **Richard Somerset Mackie**, *Trading Beyond the Mountains: The British Fur Trade on the Pacific, 1793-1843* (1997) · University of British Columbia Press
- **Richard White**, *The Middle Ground: Indians, Empires, and Republics in the Great Lakes Region, 1650-1815* (1991) · Cambridge University Press
- **Robert J. Brugger**, *Maryland: A Middle Temperament, 1634-1980* (1988) · Johns Hopkins University Press
- **Robert J. Taylor**, *Colonial Connecticut: A History* (1979) · KTO Press
- **Robin F. A. Fabel**, *The Economy of British West Florida, 1763-1783* (1988) · University of Alabama Press
- **Robin Fisher**, *Contact and Conflict: Indian-European Relations in British Columbia, 1774-1890* (1977) · University of British Columbia Press
- **Russell Shorto**, *The Island at the Center of the World* (2004) · Doubleday
- **Rusty Bittermann**, *Rural Protest on Prince Edward Island: From British Colonization to the Escheat Movement* (2006) · University of Toronto Press
- **Sean T. Cadigan**, *Newfoundland and Labrador: A History* (2009) · University of Toronto Press
- **Simon Schama**, *Rough Crossings: Britain, the Slaves and the American Revolution* (2005) · BBC Books
- **Sydney V. James**, *Colonial Rhode Island: A History* (1975) · Charles Scribner's Sons
- **Virginia Bernhard**, *Slaves and Slaveholders in Bermuda, 1616-1782* (1999) · University of Missouri Press
- **W. L. Morton**, *Manitoba: A History* (1957) · University of Toronto Press

### South Asia

_75 works, cited by `app/data/territories/south-asia.json`._

- **Alastair Lamb**, *Kashmir: A Disputed Legacy 1846-1990* (1991) · Roxford Books
- **Alex McKay**, *Tibet and the British Raj: The Frontier Cadre 1904-1947* (1997) · Curzon Press
- **Amartya Sen**, *Poverty and Famines: An Essay on Entitlement and Deprivation* (1981) · Oxford University Press
- **Ayesha Jalal**, *The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan* (1985) · Cambridge University Press
- **Barbara D. Metcalf and Thomas R. Metcalf**, *A Concise History of Modern India* (2012) · Cambridge University Press
- **Barbara N. Ramusack**, *The Indian Princes and their States* (2004) · Cambridge University Press
- **Bjorn Hettne**, *The Political Economy of Indirect Rule: Mysore 1881-1947* (1978) · Curzon Press
- **Christian Tripodi**, *Edge of Empire: The British Political Officer and Tribal Administration on the North-West Frontier 1877-1947* (2011) · Ashgate
- **Christine Dobbin**, *Urban Leadership in Western India: Politics and Communities in Bombay City 1840-1885* (1972) · Oxford University Press
- **Clare Anderson**, *The Indian Uprising of 1857-8: Prisons, Prisoners and Rebellion* (2007) · Anthem Press
- **Dadabhai Naoroji**, *Poverty and Un-British Rule in India* (1901) · primary source
- **David Omissi**, *Indian Voices of the Great War: Soldiers' Letters 1914-18* (1999) · Macmillan
- **David Washbrook**, *The Emergence of Provincial Politics: The Madras Presidency 1870-1920* (1976) · Cambridge University Press
- **Francis Robinson**, *Separatism Among Indian Muslims: The Politics of the United Provinces' Muslims 1860-1923* (1974) · Cambridge University Press
- **Gangmumei Kamei**, *A History of Modern Manipur* (1991) · Akansha
- **Gary J. Bass**, *The Blood Telegram: Nixon, Kissinger and a Forgotten Genocide* (2013) · Knopf
- **Hugh Tinker**, *A New System of Slavery: The Export of Indian Labour Overseas, 1830-1920* (1974) · Oxford University Press
- **Ian Talbot and Gurharpal Singh**, *The Partition of India* (2009) · Cambridge University Press
- **Imran Ali**, *The Punjab Under Imperialism, 1885-1947* (1988) · Princeton University Press
- **Janam Mukherjee**, *Hungry Bengal: War, Famine and the End of Empire* (2015) · Oxford University Press
- **Jayeeta Sharma**, *Empire's Garden: Assam and the Making of India* (2011) · Duke University Press
- **John Whelpton**, *A History of Nepal* (2005) · Cambridge University Press
- **Jon Wilson**, *India Conquered: Britain's Raj and the Chaos of Empire* (2016) · Simon and Schuster
- **Joya Chatterji**, *Bengal Divided: Hindu Communalism and Partition, 1932-1947* (1994) · Cambridge University Press
- **Judith M. Brown**, *Gandhi's Rise to Power: Indian Politics 1915-1922* (1972) · Cambridge University Press
- **Judith M. Brown**, *Gandhi: Prisoner of Hope* (1989) · Yale University Press
- **Judith M. Brown**, *Modern India: The Origins of an Asian Democracy* (1994) · Oxford University Press
- **K. M. de Silva**, *A History of Sri Lanka* (1981) · Oxford University Press
- **Kate Brittlebank**, *Tipu Sultan's Search for Legitimacy: Islam and Kingship in a Hindu Domain* (1997) · Oxford University Press
- **Khushwant Singh**, *A History of the Sikhs, Volume 2: 1839-2004* (2004) · Oxford University Press
- **Kim A. Wagner**, *Amritsar 1919: An Empire of Fear and the Making of a Massacre* (2019) · Yale University Press
- **Kumar Pradhan**, *The Gorkha Conquests* (1991) · Oxford University Press
- **Lucien D. Benichou**, *From Autocracy to Integration: Political Developments in Hyderabad State 1938-1948* (2000) · Orient Longman
- **Malyn Newitt**, *A History of Portuguese Overseas Expansion 1400-1668* (2005) · Routledge
- **Marina Carter**, *Servants, Sirdars and Settlers: Indians in Mauritius, 1834-1874* (1995) · Oxford University Press
- **Martin Axmann**, *Back to the Future: The Khanate of Kalat and the Genesis of Baloch Nationalism 1915-1955* (2008) · Oxford University Press
- **Michael Aris**, *The Raven Crown: The Origins of Buddhist Monarchy in Bhutan* (1994) · Serindia
- **Michael W. Charney**, *A History of Modern Burma* (2009) · Cambridge University Press
- **Mike Davis**, *Late Victorian Holocausts: El Nino Famines and the Making of the Third World* (2001) · Verso
- **Mridu Rai**, *Hindu Rulers, Muslim Subjects: Islam, Rights and the History of Kashmir* (2004) · Princeton University Press
- **Mukulika Banerjee**, *The Pathan Unarmed: Opposition and Memory in the North West Frontier* (2000) · James Currey
- **Nicholas B. Dirks**, *The Scandal of Empire: India and the Creation of Imperial Britain* (2006) · Harvard University Press
- **Nira Wickramasinghe**, *Sri Lanka in the Modern Age: A History* (2014) · Oxford University Press
- **P. J. Marshall**, *Bengal: The British Bridgehead, Eastern India 1740-1828* (1987) · Cambridge University Press
- **Rajat Datta**, *Society, Economy and the Market: Commercialization in Rural Bengal c.1760-1800* (2000) · Manohar
- **Rajat Kanta Ray**, *Palashir Sharajantra o Sekaler Samaj* (1994)
- **Ramachandra Guha**, *The Unquiet Woods: Ecological Change and Peasant Resistance in the Himalaya* (1989) · Oxford University Press
- **Robert Grant Irving**, *Indian Summer: Lutyens, Baker, and Imperial Delhi* (1981) · Yale University Press
- **Robert W. Stern**, *The Cat and the Lion: Jaipur State in the British Raj* (1988) · Brill
- **Robin Jeffrey**, *The Decline of Nayar Dominance: Society and Politics in Travancore 1847-1908* (1976) · Sussex University Press
- **Robin Jeffrey**, *Politics, Women and Well-Being: How Kerala Became a Model* (1992) · Macmillan
- **Rudrangshu Mukherjee**, *Awadh in Revolt 1857-1858: A Study of Popular Resistance* (1984) · Oxford University Press
- **Sanjib Baruah**, *India Against Itself: Assam and the Politics of Nationality* (1999) · University of Pennsylvania Press
- **Sanjib Baruah**, *Durable Disorder: Understanding the Politics of Northeast India* (2005) · Oxford University Press
- **Santanu Das**, *India, Empire and First World War Culture* (2018) · Cambridge University Press
- **Sarah F. D. Ansari**, *Sufi Saints and State Power: The Pirs of Sind, 1843-1947* (1992) · Cambridge University Press
- **Satadru Sen**, *Disciplining Punishment: Colonialism and Convict Society in the Andaman Islands* (2000) · Oxford University Press
- **Shahid Amin**, *Event, Metaphor, Memory: Chauri Chaura 1922-1992* (1995) · Oxford University Press
- **Shashi Tharoor**, *Inglorious Empire: What the British Did to India* (2017) · Hurst
- **Srinath Raghavan**, *1971: A Global History of the Creation of Bangladesh* (2013) · Harvard University Press
- **Stewart Gordon**, *The Marathas 1600-1818* (1993) · Cambridge University Press
- **Sugata Bose**, *His Majesty's Opponent: Subhas Chandra Bose and India's Struggle Against Empire* (2011) · Harvard University Press
- **Sumit Sarkar**, *The Swadeshi Movement in Bengal 1903-1908* (1973) · People's Publishing House
- **Thant Myint-U**, *The Making of Modern Burma* (2001) · Cambridge University Press
- **Thomas Barfield**, *Afghanistan: A Cultural and Political History* (2010) · Princeton University Press
- **Tirthankar Roy**, *The Economic History of India 1857-1947* (2011) · Oxford University Press
- **Tirthankar Roy**, *Natural Disasters and Indian History* (2012) · Oxford University Press
- **Urvashi Butalia**, *The Other Side of Silence: Voices from the Partition of India* (1998) · Penguin India
- **V. P. Menon**, *The Story of the Integration of the Indian States* (1956) · Orient Longman
- **Victoria Schofield**, *Kashmir in Conflict: India, Pakistan and the Unending War* (2003) · I. B. Tauris
- **William Dalrymple**, *The Last Mughal: The Fall of a Dynasty, Delhi 1857* (2006) · Bloomsbury
- **William Dalrymple**, *Return of a King: The Battle for Afghanistan* (2013) · Bloomsbury
- **William Dalrymple**, *The Anarchy: The Relentless Rise of the East India Company* (2019) · Bloomsbury
- **Yasmin Khan**, *The Great Partition: The Making of India and Pakistan* (2007) · Yale University Press
- **Yasmin Khan**, *The Raj at War: A People's History of India's Second World War* (2015) · Bodley Head

### South-East Asia and the Far East

_45 works, cited by `app/data/territories/southeast-asia-far-east.json`._

- **Austin Coates**, *A Macao Narrative* (1978) · Heinemann Educational Books
- **Barbara Watson Andaya and Leonard Y. Andaya**, *A History of Malaysia* (2017) · Palgrave Macmillan
- **C. M. Turnbull**, *The Straits Settlements 1826-67: Indian Presidency to Crown Colony* (1972) · Athlone Press
- **C. M. Turnbull**, *A History of Modern Singapore, 1819-2005* (2009) · NUS Press
- **Carl A. Trocki**, *Prince of Pirates: The Temenggongs and the Development of Johor and Singapore, 1784-1885* (1979) · Singapore University Press
- **Carl A. Trocki**, *Opium, Empire and the Global Political Economy: A Study of the Asian Opium Trade 1750-1950* (1999) · Routledge
- **Cheah Boon Kheng**, *Red Star Over Malaya: Resistance and Social Conflict During and After the Japanese Occupation, 1941-1946* (1983) · Singapore University Press
- **Cheah Boon Kheng**, *To' Janggut: Legends, Histories and Perceptions of the 1915 Rebellion in Kelantan* (2006) · Singapore University Press
- **Chris Baker and Pasuk Phongpaichit**, *A History of Thailand* (2014) · Cambridge University Press
- **Christopher Bayly and Tim Harper**, *Forgotten Armies: The Fall of British Asia, 1941-1945* (2004) · Allen Lane
- **Christopher Bayly and Tim Harper**, *Forgotten Wars: The End of Britain's Asian Empire* (2007) · Allen Lane
- **Christopher Hale**, *Massacre in Malaya: Exposing Britain's My Lai* (2013) · The History Press
- **D. S. Ranjit Singh**, *Brunei 1839-1983: The Problems of Political Survival* (1984) · Oxford University Press
- **Emily Sadka**, *The Protected Malay States, 1874-1895* (1968) · University of Malaya Press
- **Giles Milton**, *Nathaniel's Nutmeg: How One Man's Courage Changed the Course of History* (1999) · Hodder and Stoughton
- **Graham Saunders**, *A History of Brunei* (1994) · Oxford University Press
- **Heather Sutherland**, *The Taming of the Trengganu Elite* (1979) · in Ruth McVey (ed.), Southeast Asian Transitions, Yale University Press · chapter
- **Ian Black**, *A Gambling Style of Government: The Establishment of the Chartered Company's Rule in Sabah, 1878-1915* (1983) · Oxford University Press
- **J. M. Gullick**, *The Story of Kuala Lumpur, 1857-1939* (1983) · Eastern Universities Press
- **John Bastin**, *The British in West Sumatra (1685-1825)* (1965) · University of Malaya Press
- **John M. Carroll**, *A Concise History of Hong Kong* (2007) · Rowman and Littlefield
- **Julia Lovell**, *The Opium War: Drugs, Dreams and the Making of China* (2011) · Picador
- **Jurgen Osterhammel**, *Semi-Colonialism and Informal Empire in Twentieth-Century China* (1986) · in Wolfgang J. Mommsen and Jurgen Osterhammel (eds), Imperialism and After, Allen and Unwin · chapter
- **K. G. Tregonning**, *A History of Modern Sabah (North Borneo 1881-1963)* (1965) · University of Malaya Press
- **Karl Hack**, *The Malayan Emergency: Revolution and Counterinsurgency at the End of Empire* (2021) · Cambridge University Press
- **Lee Kuan Yew**, *The Singapore Story: Memoirs of Lee Kuan Yew* (1998) · Times Editions · primary source
- **Lynette Ramsay Silver**, *Sandakan: A Conspiracy of Silence* (1998) · Sally Milner Publishing
- **Matthew Jones**, *Conflict and Confrontation in South East Asia, 1961-1965: Britain, the United States and the Creation of Malaysia* (2002) · Cambridge University Press
- **Nicholas Tarling**, *Anglo-Dutch Rivalry in the Malay World, 1780-1824* (1962) · Cambridge University Press
- **Nicholas Tarling**, *Imperialism in Southeast Asia: A Fleeting, Passing Phase* (2001) · Routledge
- **Nicholas Tracy**, *Manila Ransomed: The British Assault on Manila in the Seven Years War* (1995) · University of Exeter Press
- **Nordin Hussin**, *Trade and Society in the Straits of Melaka: Dutch Melaka and English Penang, 1780-1830* (2007) · NIAS Press
- **Pamela Atwell**, *British Mandarins and Chinese Reformers: The British Administration of Weihaiwei (1898-1930) and the Territory's Return to Chinese Rule* (1985) · Oxford University Press
- **Peter Carey**, *The Power of Prophecy: Prince Dipanagara and the End of the Old Order in Java, 1785-1855* (2007) · KITLV Press
- **Peter Dennis**, *Troubled Days of Peace: Mountbatten and South East Asia Command, 1945-46* (1987) · Manchester University Press
- **Reginald Fleming Johnston**, *Lion and Dragon in Northern China* (1910) · John Murray · primary source
- **Robert Bickers**, *Britain in China: Community, Culture and Colonialism 1900-1949* (1999) · Manchester University Press
- **Robert Bickers**, *The Scramble for China: Foreign Devils in the Qing Empire, 1832-1914* (2011) · Allen Lane
- **Robert Pringle**, *Rajahs and Rebels: The Ibans of Sarawak under Brooke Rule, 1841-1941* (1970) · Macmillan
- **Shirley Fish**, *When Britain Ruled the Philippines 1762-1764* (2003) · 1st Books Library
- **Steve Tsang**, *A Modern History of Hong Kong* (2004) · I. B. Tauris
- **Steven Runciman**, *The White Rajahs: A History of Sarawak from 1841 to 1946* (1960) · Cambridge University Press
- **Tim Hannigan**, *Raffles and the British Invasion of Java* (2012) · Monsoon Books
- **Tim Harper**, *The End of Empire and the Making of Malaya* (1999) · Cambridge University Press
- **Vernon L. Porritt**, *British Colonial Rule in Sarawak, 1946-1963* (1997) · Oxford University Press

---

## 7. Geographic integrity

Checked by `node tools/validate-data.js`, which fails the build if any territory references a
geo unit that does not exist in `app/data/geo/units.index.json`. The current state:

- **302 geo units are drawn. 287 are claimed by a territory.** Every unit id referenced by
  the dataset exists. No territory invents geometry.
- **18 units are drawn but claimed by nobody.** They are deliberate. Fifteen were never
  British and are on the map only so that the British possession next door has a neighbour:
  *angola, burundi, djibouti, dominican-republic, french-guiana, french-polynesia, guam,
  mozambique, new-caledonia, puerto-rico, rwanda, wallis-futuna, american-samoa,
  ye-north-yemen* and *in-daman-diu-dadra* (Portuguese India until 1961; the British
  garrison of 1799–1813 was at Goa only, and that is what the record claims).
  Three are borderline and are documented rather than claimed:
  - **`us-alaska`** — never British, but the Hudson's Bay Company leased the mainland
    *lisière* of the Alaskan panhandle from Russia between 1839 and 1867. The unit is the
    whole modern state, so a strip cannot be drawn. The lease is described in the
    `alaska-boundary-tribunal-1903` event instead.
  - **`saint-martin`** and **`saint-barthelemy`** — both were occupied by Britain in the
    Napoleonic wars (Saint-Martin 1801–02 and 1810–16; Saint-Barthélemy briefly in 1801).
    Both are under 100 km² and neither has a record. **This is a real, if small, gap.**

Historical borders that the unit vocabulary cannot draw, and which are therefore carried in
the prose of the record that would otherwise be silently wrong:

| Cannot be drawn | Where it is stated instead |
|---|---|
| The Anglo-French partition of St Kitts, 1627–1713 | `saint-kitts` coverage marked `partial`, with the change text |
| Demerara, Essequibo and Berbice as three colonies before 1831 | `guyana` coverage labels |
| Labrador's three jurisdictional transfers (1763, 1774, 1809) and the 1927 award | `newfoundland` departure `borders` |
| Rupert's Land's true Hudson Bay watershed, taking in northern Ontario and Quebec | `ruperts-land` coverage label |
| Cape Breton as a separate colony, 1784–1820 | `nova-scotia` coverage |
| The Province of Quebec at its 1763 extent (a strip along the St Lawrence) | `quebec`, marked `partial` |
| Walvis Bay as a British then Cape enclave inside German South West Africa, 1878–1994 | `south-west-africa` prose |
| The Kalinago Territory on Dominica, created 1903 | `dominica` `consequences.retainedTerritory` |
| Balliceaux, where about 2,500 detained Garifuna died in 1796–97 | a point on the `garifuna-deportation-1797` event |
| Redonda, an Antiguan dependency from 1872 | `antigua` coverage change |
| The British-held ports of Saint-Domingue and western Cuba | `haiti` and `cuba`, `partial`, with `controlDegree` overridden to 3 |
| The Essequibo region west of the 1899 line, now before the ICJ | `guyana` `consequences.borderLegacy` |
| The Haldimand Tract (1784) and the Métis river lots of Red River | `upper-canada` and `red-river-colony` prose |
| Newfoundland's French Shore, 1713–1904 | `newfoundland` prose and event places |

Overlapping claims — a princely state inside British India, a fort inside a colony, a state
inside a federation — are legitimate and are declared with `nestedWithin`, which accepts an
array where a place sat inside different umbrellas at different times (Penang was a Straits
Settlement, then part of the Federation of Malaya). The validator treats two territories in
the same containment tree as compatible and flags every other simultaneous double claim.

---

## 8. Rebuilding this file

The bibliography section is mechanical: it is the deduplicated union of every `citation`
object in `app/data/territories/*.json`. Sections 1–5 are editorial and are maintained by
hand. If you add citations to a shard, regenerate the list and paste it back under §6.

```
node tools/validate-data.js          # 0 errors is the release bar
node tools/audit-timeline.js --check # the numbers against a historian's expectations
node tools/build-manifest.js         # regenerate app/data/index.json
```

_Last consolidated: 2026-09-04 · 260 territories · 308 events · 629 works._
