# Robust Deduplication Report (v2)

**Date:** 2026-01-25T19:31:46.903Z
**Groups Found:** 165

## ✅ Section A: Safe to Merge (High/Medium Confidence)
These pairs share Postcodes or are within 1km. **Touchwood should be here.**

| Group | Logic | Survivor | Victims |
| :--- | :--- | :--- | :--- |
| **GRP-1** | Close Proximity (20m) | **Chelmsley Wood Shopping Centre** (Chelmsley Wood (Solihull)) | Chelmsley Wood Shopping Centre |
| **GRP-3** | Exact Postcode Match | **One Stop Shopping Centre** (Birmingham (Perry Barr)) | One Stop Shopping Centre |
| **GRP-7** | Exact Postcode Match | **The Quadrant Centre** (Swansea) | The Quadrant Shopping Centre, Quadrant Centre |
| **GRP-16** | Close Proximity (108m) | **The Stamford Quarter** (Altrincham) | Stamford Quarter |
| **GRP-19** | Exact Postcode Match | **Horsham (Other)** (-) | Amersham (Other), Chesham (Other), Caterham (Other) |
| **GRP-20** | Exact Postcode Match | **Aylesbury (Other)** (-) | Aylesford (Other) |
| **GRP-21** | Exact Postcode Match | **Barking (Other)** (-) | Dorking (Other), Tring (Other), Woking (Other) |
| **GRP-22** | Exact Postcode Match | **Barnet (Other)** (-) | Ware (Other) |
| **GRP-23** | Exact Postcode Match | **Beckenham (Other)** (-) | Twickenham (Other) |
| **GRP-24** | Exact Postcode Match | **Fleet (Other)** (-) | Benfleet (Other), Purfleet (Other) |
| **GRP-25** | Exact Postcode Match | **Betchworth (Other)** (-) | Petworth (Other) |
| **GRP-26** | Exact Postcode Match | **Crawley (Other)** (-) | Brackley (Other), Tadley (Other) |
| **GRP-27** | Exact Postcode Match | **Bordon (Other)** (-) | Morden (Other), Croydon (Other) |
| **GRP-28** | Exact Postcode Match | **Hertford (Other)** (-) | Brentford (Other), Greenford (Other) |
| **GRP-29** | Exact Postcode Match | **Bushey (Other)** (-) | Esher (Other), Purley (Other) |
| **GRP-30** | Exact Postcode Match | **Chatham (Other)** (-) | Cobham (Other), Feltham (Other), Witham (Other) |
| **GRP-31** | Exact Postcode Match | **Epping (Other)** (-) | Reading (Other), Welling (Other) |
| **GRP-32** | Exact Postcode Match | **Dartford (Other)** (-) | Watford (Other) |
| **GRP-33** | Exact Postcode Match | **Edenbridge (Other)** (-) | Tonbridge (Other) |
| **GRP-34** | Exact Postcode Match | **Egham (Other)** (-) | Epsom (Other) |
| **GRP-35** | Exact Postcode Match | **Gillingham (Other)** (-) | Warlingham (Other) |
| **GRP-36** | Exact Postcode Match | **Grays (Other)** (-) | Hayes (Other) |
| **GRP-37** | Exact Postcode Match | **Halstead (Other)** (-) | Ashtead (Other) |
| **GRP-38** | Exact Postcode Match | **Hitchin (Other)** (-) | Mitcham (Other) |
| **GRP-39** | Exact Postcode Match | **Enfield (Other)** (-) | Hatfield (Other), Heathfield (Other) |
| **GRP-40** | Exact Postcode Match | **Hockley (Other)** (-) | Horley (Other) |
| **GRP-41** | Exact Postcode Match | **Iver (Other)** (-) | Pinner (Other) |
| **GRP-42** | Exact Postcode Match | **Harlow (Other)** (-) | Marlow (Other), Harrow (Other) |
| **GRP-43** | Exact Postcode Match | **Midhurst (Other)** (-) | Sandhurst (Other), Wadhurst (Other) |
| **GRP-44** | Exact Postcode Match | **Northolt (Other)** (-) | Northwood (Other) |
| **GRP-45** | Exact Postcode Match | **Rochester (Other)** (-) | Worcester Park (Other) |
| **GRP-46** | Exact Postcode Match | **Surbiton (Other)** (-) | Sutton (Other) |
| **GRP-47** | Exact Postcode Match | **Wallington (Other)** (-) | Wallingford (Other) |
| **GRP-89** | Close Proximity (68m) | **Richmond Gardens Shopping Centre** (Bournemouth) | Richmond Gardens Shopping Centre |
| **GRP-108** | Close Proximity (78m) | **The Sovereign** (Weston-super-Mare) | The Sovereign |
| **GRP-109** | Close Proximity (65m) | **Lower Precinct Shopping Centre** (Coventry) | Lower Precinct |
| **GRP-112** | Close Proximity (338m) | **St Martin's Walk** (Dorking) | St. Martins Walk |
| **GRP-114** | Exact Postcode Match | **St Stephens Shopping Centre** (Hull) | St Stephen's, St. Stephens Shopping Centre |
| **GRP-121** | Exact Postcode Match | **Hardshaw Centre** (St Helens) | The Hardshaw Centre |
| **GRP-134** | Exact Postcode Match | **The Walnuts** (Orpington) | Walnuts Shopping Centre |
| **GRP-141** | Exact Postcode Match | **Willows** (Wickford) | Willows Centre |
| **GRP-143** | Exact Postcode Match | **Weston Favell Shopping Centre** (Northampton) | Weston Favell Shopping Centre |
| **GRP-144** | Close Proximity (0m) | **Royals** (Southend-on Sea) | The Royals Shopping Centre |
| **GRP-150** | Exact Postcode Match | **Hook (Other)** (-) | Liphook (Other) |
| **GRP-154** | Exact Postcode Match | **5 Rise Shopping Centre** (Bingley) | 5rise Shopping Centre |
| **GRP-164** | Close Proximity (141m) | **Bullring** (West Midlands) | Bullring |

## ⚠️ Section B: Data Integrity Issues (Coordinate Errors)
Name matches but distance > 50km. Suggests one record has `0.00,0.00` or wrong coords. **Merge advisable ONLY if one coord is clearly 0.**

### Group GRP-2: Armthorpe Shopping Centre
*Reason: Name Match but Distant (165km) - Lat/Long Error?*
- Armthorpe Shopping Centre (Armthorpe) [53.535882, -1.050384] - ID: `cmicxw475000213hxaprrzpgq`
- The Calthorpe Centre (Oxfordshire) [52.059043, -1.339747] - ID: `cmid0l26201vqmtpuvgovknue`

### Group GRP-6: Middleton Shopping Centre
*Reason: Name Match but Distant (335km) - Lat/Long Error?*
- Middleton Shopping Centre (Middleton) [53.548259, -2.201049] - ID: `cmicxw4l3000w13hxpi1ja553`
- Singleton Centre (Kent) [51.140038, 0.839241] - ID: `cmid0l03n01tomtpucxh3d2wn`

### Group GRP-11: The Parkway Centre
*Reason: Name Match but Distant (347km) - Lat/Long Error?*
- The Parkway Centre (Middlesbrough) [54.524385, -1.216349] - ID: `cmicxw4nw001213hxg33cfetn`
- Parkway Shopping Centre (Berkshire) [51.403953, -1.323382] - ID: `cmid0ky6y01rpmtpu9wv5rc7k`
- Parkgate (West Midlands) [52.411437, -1.827224] - ID: `cmid0ky5x01romtpumhlvys3e`

### Group GRP-13: Victoria Square
*Reason: Name Match but Distant (296km) - Lat/Long Error?*
- Victoria Square (Belfast) [54.597899, -5.925293] - ID: `cmks95ldg0008fajkhu4i43ns`
- Victoria Quarter (West Yorkshire) [53.798248, -1.541049] - ID: `cmid0l65901zymtpujztzez8p`

### Group GRP-14: St George's Shopping Centre
*Reason: Name Match but Distant (149km) - Lat/Long Error?*
- St George's Shopping Centre (Harrow) [51.581467, -0.338953] - ID: `cmksclxnc00099atsn6ptzs4z`
- St. George's Shopping Centre (Greater London) [51.581467, -0.338953] - ID: `cmid0l0l301u6mtpufktkvm1s`
- St. Georges Shopping Centre (Kent) [51.443058, 0.366991] - ID: `cmid0l0m001u7mtpui6gc33qz`
- The George Shopping Centre (Lincolnshire) [52.912271, -0.643023] - ID: `cmid0l2x301wimtpuz0usot5o`

### Group GRP-49: The Regent Centre
*Reason: Name Match but Distant (403km) - Lat/Long Error?*
- The Regent Centre (Kirkintilloch) [55.939241, -4.157451] - ID: `cmkscly0f000i9ats9p3kzm98`
- Regent Shopping Centre (East Dunbartonshire) [55.939241, -4.157451] - ID: `cmid0kz8b01sqmtpuph3gzo9p`
- The Crescent (Leicestershire) [52.538281, -1.377543] - ID: `cmid0l2jc01w3mtpu0zzxphyt`
- Trident Shopping Centre (West Midlands) [52.509722, -2.084377] - ID: `cmid0l5py01zimtpuo88k0ekg`

### Group GRP-59: Kennedy Centre
*Reason: Name Match but Distant (464km) - Lat/Long Error?*
- Kennedy Centre (Belfast) [54.581276, -5.978344] - ID: `cmksmaxik0005x52rh4x074cy`
- The Kennet Shopping Centre (Berkshire) [51.399793, -1.323803] - ID: `cmid0l3c301wymtpujx05mrgt`

### Group GRP-66: Aldridge Shopping Centre
*Reason: Name Match but Distant (121km) - Lat/Long Error?*
- Aldridge Shopping Centre (West Midlands) [52.604306, -1.917647] - ID: `cmid0koxk01icmtpu6s438yq7`
- The Bridge Shopping Centre (Hampshire) [50.798578, -1.077855] - ID: `cmid0l1s801vemtpu5d1lva0z`
- The Bridge Centre (Cambridgeshire) [52.340227, -0.186907] - ID: `cmid0l1r901vdmtpu55ve7fkx`

### Group GRP-67: The Arcadian
*Reason: Name Match but Distant (152km) - Lat/Long Error?*
- The Arcadian (Birmingham) [52.474547, -1.896601] - ID: `cmid0kp6601ilmtpufcvk2v56`
- The Arcadia Centre (Greater London) [51.51401, -0.303951] - ID: `cmid0l1gg01v4mtputx10gs4f`

### Group GRP-72: The Broadway
*Reason: Name Match but Distant (143km) - Lat/Long Error?*
- The Broadway (Bradford) [53.794073, -1.750007] - ID: `cmksanu6q0004zky05rxawa6a`
- Broadway Shopping Centre (Greater London) [51.499419, -0.134251] - ID: `cmid0kqm501jymtpupga3g087`
- The Broadwalk Centre (Greater London) [51.611708, -0.275874] - ID: `cmid0l1xo01vhmtpuozbcaede`
- Ropewalk Shopping Centre (Nuneaton) [52.521908, -1.469654] - ID: `cmkst205100012zgss5rqyhf6`
- Broadway Shopping Centre (Bexleyheath) [51.455838, 0.145999] - ID: `cmid0kqn101jzmtpuf45o33vk`
- Broadwalk Shopping Centre (City Of Bristol) [51.434424, -2.56801] - ID: `cmid0kqk501jwmtputu5nu1wi`
- The Boardwalk (Hampshire) [50.84086, -1.097076] - ID: `cmid0l1nn01vamtpuuijsj9e0`

### Group GRP-76: Castle Dene Shopping Centre
*Reason: Name Match but Distant (390km) - Lat/Long Error?*
- Castle Dene Shopping Centre (Durham) [54.759088, -1.334105] - ID: `cmid0kr8701klmtpu9rlgqym9`
- Castlemead Shopping Centre (Somerset) [51.372043, -2.914085] - ID: `cmid0krdl01krmtpu7xx7v3k7`

### Group GRP-78: The Churchill Shopping Centre
*Reason: Name Match but Distant (122km) - Lat/Long Error?*
- The Churchill Shopping Centre (West Midlands) [52.510489, -2.080562] - ID: `cmid0l2e201vzmtpu66q90fia`
- Church Walk Shopping Centre (Surrey) [51.281554, -0.07723] - ID: `cmid0krv501lamtpu97t6szsx`
- The Churchill Centre (Dudley) [52.510389, -2.081093] - ID: `cmksfw8n5000bivpad9njtzxi`
- Churchill Shopping Centre (Merseyside) [53.48296, -2.935506] - ID: `cmid0krx501lcmtpu5m5s21kr`

### Group GRP-83: Castle Place Shopping Centre
*Reason: Name Match but Distant (265km) - Lat/Long Error?*
- Castle Place Shopping Centre (Wiltshire) [51.319695, -2.207285] - ID: `cmid0kr9401kmmtpu9ha60asv`
- Marble Place Shopping Centre (Merseyside) [53.646282, -3.00459] - ID: `cmid0kwba01pomtputr1bhwgy`

### Group GRP-84: Friars Walk Shopping Centre
*Reason: Name Match but Distant (156km) - Lat/Long Error?*
- Friars Walk Shopping Centre (Newport) [51.586877, -2.99381] - ID: `cmid0ku2901ndmtpuqztub86v`
- Rams Walk Shopping Mall (Hampshire) [51.004358, -0.936684] - ID: `cmid0kz4g01smmtpumsd9lvrh`

### Group GRP-85: The Forum Shopping Centre
*Reason: Name Match but Distant (167km) - Lat/Long Error?*
- The Forum Shopping Centre (Tyne And Wear) [54.991068, -1.536386] - ID: `cmid0l2re01wcmtpu9n25lq3z`
- Fosse Park (Leicester) [52.597462, -1.180984] - ID: `cmks9w2wy0001p2aauakdcyww`
- Forest Centre (Hampshire) [51.108849, -0.858065] - ID: `cmid0ktwh01n7mtpu9xl1spm0`
- The Forge (Cheshire) [53.371308, -2.582332] - ID: `cmid0l2pn01wamtpu616j3a1i`

### Group GRP-86: The Heart Shopping Centre
*Reason: Name Match but Distant (276km) - Lat/Long Error?*
- The Heart Shopping Centre (Walton-on-Thames) [51.385115, -0.420086] - ID: `cmicxw4ei000i13hxr8mty7fq`
- Gerard Centre (Greater Manchester) [53.4864, -2.63676] - ID: `cmid0ku8301njmtpuiitzu4fg`

### Group GRP-88: Princesshay
*Reason: Name Match but Distant (205km) - Lat/Long Error?*
- Princesshay (Exeter) [50.724405, -3.527684] - ID: `cmid0kyqa01s7mtpugziugzyx`
- Princes Quay (Hull) [53.742572, -0.339365] - ID: `cmid0kynn01s4mtpu9mfvybh5`
- Princes Mead Shopping Centre (Hampshire) [51.291906, -0.757914] - ID: `cmid0kymn01s3mtpulcdx6udo`

### Group GRP-91: Heywood Shopping Centre
*Reason: Name Match but Distant (125km) - Lat/Long Error?*
- Heywood Shopping Centre (Greater Manchester) [53.592821, -2.217442] - ID: `cmid0kuy201o8mtpuoc1ljhpl`
- Bearwood Shopping Centre (West Midlands) [52.474912, -1.969077] - ID: `cmid0kpph01izmtpu8b4wfvlr`

### Group GRP-92: Hillstreet Centre
*Reason: Name Match but Distant (299km) - Lat/Long Error?*
- Hillstreet Centre (North Yorkshire) [54.577299, -1.238556] - ID: `cmid0kv4m01ofmtpuubqthcdh`
- High Street Shopping Centre (Norfolk) [52.580888, 1.728149] - ID: `cmid0kuzt01oamtpumtp351s6`

### Group GRP-95: Livat Shopping Centre
*Reason: Name Match but Distant (272km) - Lat/Long Error?*
- Livat Shopping Centre (Greater London) [51.492994, -0.227272] - ID: `cmid0kvyp01pbmtpuraxhffvr`
- The Light (West Yorkshire) [53.800063, -1.545675] - ID: `cmid0l3iu01x5mtpu9erdfp7g`

### Group GRP-98: Market Gates Shopping Centre
*Reason: Name Match but Distant (336km) - Lat/Long Error?*
- Market Gates Shopping Centre (Norfolk) [52.60811, 1.728601] - ID: `cmid0kwd201pqmtpu2tg7ecjx`
- The Martingate Centre (Wiltshire) [51.431885, -2.186272] - ID: `cmid0l3yi01xmmtpuwa0lx6kn`
- Market Walk Shopping Centre (Devon) [50.530495, -3.611066] - ID: `cmid0kwgs01pumtpuehaszmcm`
- Marketgate (Lancashire) [54.048287, -2.801015] - ID: `cmid0kwhp01pvmtpu7uy3cmc0`

### Group GRP-99: Marlands
*Reason: Name Match but Distant (248km) - Lat/Long Error?*
- Marlands (Southampton) [50.905897, -1.405884] - ID: `cmicxw4k6000u13hx3cyx1jyy`
- The Marlands Shopping Centre (Hampshire) [50.905897, -1.405884] - ID: `cmid0l3vo01xjmtpumh74fin1`
- Moorland Shopping Centre (Staffordshire) [53.105187, -2.025454] - ID: `cmid0kx3a01qimtpumwmi830e`

### Group GRP-100: New Cross Shopping Centre
*Reason: Name Match but Distant (386km) - Lat/Long Error?*
- New Cross Shopping Centre (South Lanarkshire) [55.77437, -4.036991] - ID: `cmid0kx7x01qnmtpuij2843ti`
- West Cross Shopping Centre (West Midlands) [52.502155, -1.990345] - ID: `cmid0l6l0020dmtpueeckm134`

### Group GRP-101: Orchard Shopping Centre
*Reason: Name Match but Distant (237km) - Lat/Long Error?*
- Orchard Shopping Centre (Taunton) [51.013794, -3.102354] - ID: `cmid0kxuy01rcmtpuod0qok4s`
- The Orchards Shopping Centre (Kent) [51.444897, 0.218738] - ID: `cmid0l4aj01xzmtpuvix0j5zt`
- Orchard Centre (Oxfordshire) [51.607185, -1.238244] - ID: `cmid0kxt301ramtpu5junmray`
- Orchards (West Sussex) [50.997473, -0.102221] - ID: `cmid0kxww01remtpujzacv0id`

### Group GRP-104: Friars Square Shopping Centre
*Reason: Name Match but Distant (104km) - Lat/Long Error?*
- Friars Square Shopping Centre (Aylesbury) [51.815478, -0.813218] - ID: `cmid0ku1a01ncmtpu0vfednve`
- Priory Square Shopping Centre (West Midlands) [52.481431, -1.894641] - ID: `cmid0kyt501samtpuw9zlc9sp`
- Riley Square Shopping Centre (West Midlands) [52.436124, -1.473318] - ID: `cmid0kzbs01sumtpu21az5kul`

### Group GRP-105: Queensgate Shopping Centre
*Reason: Name Match but Distant (162km) - Lat/Long Error?*
- Queensgate Shopping Centre (Peterborough) [52.573311, -0.245536] - ID: `cmksclyld000q9atsz1g1ihxe`
- Queens Walk Shopping Centre (West Sussex) [51.124545, -0.009629] - ID: `cmid0kz3j01slmtpuo661989k`

### Group GRP-106: Saxon Square Shopping Centre
*Reason: Name Match but Distant (713km) - Lat/Long Error?*
- Saxon Square Shopping Centre (Dorset) [50.73551, -1.777693] - ID: `cmid0kzy401timtpu4h2v5e53`
- Union Square (Aberdeen) [50.46733, -3.529232] - ID: `cmid0l5xu01zqmtpupiuulscc`
- Union Square (Aberdeen City) [57.144354, -2.096083] - ID: `cmid0l5wu01zpmtpuxgcdahu0`

### Group GRP-111: St Johns Shopping Centre
*Reason: Name Match but Distant (331km) - Lat/Long Error?*
- St Johns Shopping Centre (Liverpool) [53.406734, -2.981654] - ID: `cmksais0y0001t03phhqcnl5v`
- St Johns Centre (Leeds) [53.80029, -1.543957] - ID: `cmkss209p0004cy3u0lt3u0fr`
- St. Govans Shopping Centre (Pembrokeshire) [51.69439, -4.942063] - ID: `cmid0l0ny01u9mtpupudzg4ki`
- St. John's Shopping Centre (Lancashire) [53.76061, -2.697797] - ID: `cmid0l0ox01uamtpurxp9rnbz`
- St. Johns Centre (West Yorkshire) [53.80029, -1.543957] - ID: `cmid0l0pt01ubmtpu6jpm6u7j`
- St. Johns Shopping Centre (Merseyside) [53.406734, -2.981654] - ID: `cmid0l0qs01ucmtpuj6aeqmxy`

### Group GRP-113: Islington Square
*Reason: Name Match but Distant (265km) - Lat/Long Error?*
- Islington Square (London (Angel)) [51.538914, -0.102742] - ID: `cmksema8x0003oqpnipotmcez`
- Swinton Square (Greater Manchester) [53.512615, -2.338573] - ID: `cmid0l19801uwmtput5wc7wns`

### Group GRP-115: The Square Camberley
*Reason: Name Match but Distant (254km) - Lat/Long Error?*
- The Square Camberley (Camberley) [53.424554, -2.322329] - ID: `cmid0l0z701ulmtpu3jrtfa1u`
- The Square Camberley (Surrey) [51.338273, -0.745565] - ID: `cmid0l52j01ytmtpuu22jguh1`

### Group GRP-116: The Brooks Shopping Centre
*Reason: Name Match but Distant (320km) - Lat/Long Error?*
- The Brooks Shopping Centre (Hampshire) [51.063024, -1.312357] - ID: `cmid0l1zf01vjmtpuzah45z1e`
- The Moors Shopping Centre (West Yorkshire) [53.925519, -1.825652] - ID: `cmid0l45001xtmtpuphdublht`

### Group GRP-117: The Brunswick Centre
*Reason: Name Match but Distant (307km) - Lat/Long Error?*
- The Brunswick Centre (Greater London) [51.524182, -0.123897] - ID: `cmid0l22401vmmtpu6oq20c6e`
- The Brunswick Shopping Centre (North Yorkshire) [54.280954, -0.402696] - ID: `cmid0l23201vnmtpuzg99gypi`

### Group GRP-118: Bramley Shopping Centre
*Reason: Name Match but Distant (187km) - Lat/Long Error?*
- Bramley Shopping Centre (West Yorkshire) [53.811865, -1.626584] - ID: `cmid0kq9w01jlmtpu1y4egqsb`
- The Burghley Centre (Lincolnshire) [52.76892, -0.376565] - ID: `cmid0l23x01vomtpu75on38q4`
- Buckley Shopping Centre (Flintshire) [53.16795, -3.078859] - ID: `cmid0kqp101k1mtpuheeceody`

### Group GRP-125: The Merrion Centre
*Reason: Name Match but Distant (351km) - Lat/Long Error?*
- The Merrion Centre (Leeds) [53.80163, -1.544049] - ID: `cmksclxxw000h9atsf5lv672y`
- Merrion Centre (West Yorkshire) [53.80163, -1.544049] - ID: `cmid0kwrr01q6mtpu5p36gqdv`
- Meridian Centre (Hampshire) [50.852129, -0.982384] - ID: `cmid0kwp101q3mtpumdp0x5r8`
- The Meridian Centre (East Sussex) [50.795808, 0.001901] - ID: `cmid0l43501xrmtpumkjthiso`

### Group GRP-126: The Piazza Shopping Centre
*Reason: Name Match but Distant (295km) - Lat/Long Error?*
- The Piazza Shopping Centre (Renfrewshire) [55.846874, -4.422785] - ID: `cmid0l4jy01y9mtpugydxi9jo`
- The Piazza Centre (West Yorkshire) [53.644473, -1.780643] - ID: `cmid0l4j101y8mtpuxe9yyrc2`

### Group GRP-127: Pentagon Shopping Centre
*Reason: Name Match but Distant (217km) - Lat/Long Error?*
- Pentagon Shopping Centre (Kent) [51.383522, 0.525865] - ID: `cmid0l4i401y7mtpubsy0mecw`
- Pentagon (Chatham) [51.383568, 0.525393] - ID: `cmicxw4os001413hx44wpfxxm`
- The Octagon Centre (Staffordshire) [52.800708, -1.633701] - ID: `cmid0l47t01xwmtpuzud27nl5`
- The Octagon (Burton upon Trent) [52.800708, -1.633701] - ID: `cmksfw8rg000divpaw58re2mm`

### Group GRP-131: Wellgate Shopping Centre
*Reason: Name Match but Distant (124km) - Lat/Long Error?*
- Wellgate Shopping Centre (Dundee City) [56.463937, -2.969435] - ID: `cmid0l6ga020amtpuhe54iqk3`
- Mill Gate Shopping Centre (Greater Manchester) [53.592518, -2.295488] - ID: `cmid0kwzk01qemtpuu7bfnc8h`
- Woolgate Shopping Centre (Oxfordshire) [51.784934, -1.484316] - ID: `cmid0l7kn021bmtpuyr5k8l0c`
- Tollgate Shopping Centre (West Midlands) [52.496048, -1.972347] - ID: `cmid0l5gp01z8mtpuwi6shhlr`

### Group GRP-135: Culver Square
*Reason: Name Match but Distant (273km) - Lat/Long Error?*
- Culver Square (Colchester) [51.888809, 0.897647] - ID: `cmkswynsd0003d3izopfxfr5y`
- Weavers Wharf Shopping Park (Kidderminster) [52.386978, -2.25044] - ID: `cmicxw4y7001o13hxp4niwnzx`
- Weaver Square Shopping Centre (Cheshire) [53.261134, -2.513552] - ID: `cmid0l6fe0209mtpua9folbqp`

### Group GRP-136: White Rose Shopping Centre
*Reason: Name Match but Distant (158km) - Lat/Long Error?*
- White Rose Shopping Centre (Leeds) [53.75787, -1.574143] - ID: `cmid0l75y020xmtpu5n0vfpo8`
- White Rose Centre (Rhyl) [53.321614, -3.490344] - ID: `cmid0l73s020vmtpu7tzhi38x`
- White Rose Retail Centre (South Yorkshire) [53.514508, -1.128376] - ID: `cmid0l752020wmtpuqgpbtm0h`

### Group GRP-139: Dunmail Park Shopping Centre
*Reason: Name Match but Distant (141km) - Lat/Long Error?*
- Dunmail Park Shopping Centre (Cumbria) [54.657013, -3.552725] - ID: `cmid0kt5m01mfmtpuxjhrrlnt`
- Denmark Centre (Tyne And Wear) [54.998432, -1.431286] - ID: `cmid0ksyh01m9mtpuvj8veb3d`

### Group GRP-140: The Mall Maidstone
*Reason: Name Match but Distant (278km) - Lat/Long Error?*
- The Mall Maidstone (Maidstone) [51.272846, 0.525439] - ID: `cmid0l3q401xdmtpu8jc8n7z8`
- Bridestone Shopping Centre (Cheshire) [53.163615, -2.213096] - ID: `cmid0kqcr01jomtputengxhnq`

### Group GRP-142: Tipton Shopping Centre
*Reason: Name Match but Distant (183km) - Lat/Long Error?*
- Tipton Shopping Centre (West Midlands) [52.529061, -2.067477] - ID: `cmid0l5ep01z6mtpu334tvsqb`
- Totton Shopping Centre (Totton) [50.919283, -1.48844] - ID: `cmid0l5hl01z9mtpucgubpb4w`

### Group GRP-153: Belle Vale Shopping Centre
*Reason: Name Match but Distant (340km) - Lat/Long Error?*
- Belle Vale Shopping Centre (Merseyside) [53.391176, -2.858878] - ID: `cmid0kptd01j3mtpua2v1ii7p`
- Bell Walk Shopping Centre (Uckfield) [50.969024, 0.095252] - ID: `cmicxw48h000513hxtb3l36m6`

### Group GRP-156: The Meadows
*Reason: Name Match but Distant (105km) - Lat/Long Error?*
- The Meadows (Chelmsford) [51.731773, 0.475834] - ID: `cmksclxx3000g9ats4xhyetsk`
- Meadow Shopping Centre (Buckinghamshire) [52.000768, -0.985887] - ID: `cmid0kwle01pzmtpu94hrp33b`

### Group GRP-161: Erith Riverside Shopping Centre
*Reason: Name Match but Distant (177km) - Lat/Long Error?*
- Erith Riverside Shopping Centre (Greater London) [51.480354, 0.180045] - ID: `cmid0ktnv01mymtput2j9jrky`
- Bath Riverside (Bath) [51.382209, -2.375387] - ID: `cmksemamj000coqpn4igflqyi`


## 🛑 Section C: Name Collisions (Do Not Merge)
Generic names (e.g. 'Kingfisher', 'Riverside') in different towns. **Ignore these.**

- **GRP-4**: Lion Yard Shopping Centre (Cambridge) vs Eden Walk Shopping Centre (Greater London) vs Lion Walk Shopping Centre (Colchester) vs Cibi Walk (Monmouthshire) vs Swan Walk Shopping Centre (West Sussex) vs Crown Walk Shopping Centre (Oxfordshire) vs Lion Walk Shopping Centre (Essex) [Name Match but Distant (64km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-5**: Coopers Square Shopping Centre (Staffordshire) vs Carters Square (Uttoxeter) [Generic Name Match in same region (19km)]
- **GRP-8**: The Shires Shopping Centre (Trowbridge) vs The Chimes (Greater London) vs The Spires Shopping Centre (Barnet) vs St. Giles Shopping Centre (Moray) [Name Match but Distant (144km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-9**: Rainham Shopping Centre (Rainham) vs Chineham Shopping Centre (Hampshire) [Name Match but Distant (116km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-10**: Eden Shopping Centre (High Wycombe) vs St Anns Shopping Centre (Harrow) vs St. Ann's Shopping Centre (Greater London) vs Oak Mall Shopping Centre (Inverclyde) vs W12 Shopping Centre (Shepherd's Bush) vs The Swan Centre (Eastleigh) vs Swanley Shopping Centre (Swanley) vs Alway Shopping Centre (Newport) vs The Strand Shopping Centre (Bootle) vs Strand Shopping Centre (Merseyside) vs Gwent Shopping Centre (Blaenau Gwent) vs Swan Centre (Warwickshire) vs Swan Shopping Centre (Surrey) vs The Swan Centre (Worcestershire) vs The Swan Shopping Centre (Hampshire) vs Town Centre (Kent) [Name Match but Distant (85km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-12**: The Killingworth Centre (Killingworth) vs Killingworth Shopping Centre (Tyne And Wear) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-15**: The Centre Margate,  (Margate) vs Overgate Centre (Dundee) vs Emery Gate Shopping Centre (Chippenham) vs Rivergate Shopping Centre (North Ayrshire) vs Coppergate Shopping Centre (North Yorkshire) vs Newgate Shopping Centre (Durham) vs The Leegate Shopping Centre (Greater London) [Name Match but Distant (302km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-17**: The Academy Shopping Centre (Aberdeen City) vs Arcades Shopping Centre (Greater Manchester) vs The Arcade (Hampshire) [Name Match but Distant (407km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-18**: Trinity Centre (Aberdeen City) vs Treaty Shopping Centre (Greater London) [Name Match but Distant (640km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-48**: Willow Place (Corby) vs Milsom Place Shopping Centre (Somerset) vs Willow Place (Northamptonshire) [Name Match but Distant (166km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-50**: Telford Centre (Shropshire) vs The Trafford Centre (Manchester (Trafford)) vs The Belfry Shopping Centre (Surrey) vs Stretford Mall (Greater Manchester) vs The Catford Centre (Greater London) [Name Match but Distant (86km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-51**: Cornmill Centre (Darlington) vs Cornmill Shopping Centre (Durham) [Close Proximity (74m) [WEBSITE CONFLICT]]
- **GRP-52**: The Pavilions (Uxbridge) vs The Pavilion (Thornaby-on-Tees) vs Pavilions Shopping Centre (Hertfordshire) vs Pavilion Shopping Centre (Kent) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-53**: Abbey Centre (Newtownabbey) vs Abbey Shopping Centre (Oxfordshire) vs The Market Shopping Centre (Cheshire) vs The Valley (Worcestershire) vs The Harpur Centre (Bedfordshire) vs The Harvey Centre (Harlow) vs Harvey Centre (Essex) vs The Hart Shopping Centre (Hampshire) [Name Match but Distant (524km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-54**: Newkirkgate Shopping Centre (City Of Edinburgh) vs The Kirkgate Shopping Centre (West Yorkshire) vs New Kirkgate (Edinburgh (Leith)) [Name Match but Distant (258km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-55**: CastleCourt (Belfast) vs Castle Court Shopping Centre (Caerphilly) [Name Match but Distant (379km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-56**: Broad Street Mall (Berkshire) vs Bow Street Mall (Lisburn) [Name Match but Distant (472km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-57**: Rushmere Shopping Centre (Craigavon) vs The Rushes (Leicestershire) [Name Match but Distant (383km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-58**: Grays Shopping Centre (Essex) vs Arc Shopping Centre (Bury St Edmunds) vs The Malls Shopping Centre (Basingstoke) vs Armada Centre (Devon) vs Ards Shopping Centre (Newtownards) vs Burns Mall (East Ayrshire) vs The Lanes Shopping Centre (Carlisle) vs Arc (Suffolk) vs The Braes Shopping Centre (Glasgow City) vs The Oaks (Greater London) vs The Marsh Centre (Hythe) vs Park Farm Shopping Centre (Derbyshire) vs The Malls (Hampshire) [Name Match but Distant (480km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-60**: Meadowhall Centre (Sheffield) vs Meadowlane Shopping Centre (Magherafelt) vs Meadowhall (Sheffield) [Name Match but Distant (365km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-61**: Grand Arcade (Cambridge) vs Grand Arcade (Wigan) [Name Match but Distant (235km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-62**: The Moor Shopping Centre (West Midlands) vs N1 Shopping Centre (Islington) vs centre:mk (Milton Keynes) vs Park Centre (Belfast) vs The Mall (Greater London) vs O2 Centre (Greater London) vs Omni Centre (City Of Edinburgh) vs Park Mall (Kent) vs The Centre (West Lothian) vs The Hub:Mk (Buckinghamshire) vs The Rock (Greater Manchester) vs The Shopping Centre (Newport) [Name Match but Distant (72km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-63**: The Howard Centre (Hertfordshire) vs Tower Centre (Ballymena) vs Tower Park (Poole) vs Howard Centre (Bedfordshire) vs The Core (Leeds) [Name Match but Distant (325km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-64**: Centrale Shopping Centre (Croydon) vs The Bentall Centre (Kingston upon Thames) vs 17&Central (Greater London) [Generic Name Match in same region (24km) [WEBSITE CONFLICT]]
- **GRP-65**: St Nicholas Centre (Sutton) vs St. Nicholas Shopping Centre (Greater London) [Close Proximity (88m) [WEBSITE CONFLICT]]
- **GRP-68**: Bayview Shopping Centre (Colwyn Bay) vs The Baytree Centre (Essex) vs Park View Shopping Centre (Tyne And Wear) [Name Match but Distant (246km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-69**: The Brunel (Swindon) vs The Brunel Centre (Buckinghamshire) [Name Match but Distant (87km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-70**: Eastgate Shopping Centre (Gloucester) vs Eastgate Centre (Inverness) vs Westgate Shopping Centre (Hertfordshire) vs Eastgate Shopping Centre (Ipswich) vs Eastgate Shopping Centre (Highland) [Name Match but Distant (733km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-71**: Gyle Shopping Centre (City Of Edinburgh) vs St. Elli Shopping Centre (Carmarthenshire) vs Bell Shopping Centre (Leicestershire) [Name Match but Distant (389km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-73**: Buttermarket Shopping Centre (Suffolk) vs The Buttermarket Shopping Centre (Nottinghamshire) [Name Match but Distant (176km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-74**: Byron Place Shopping Centre (Seaham) vs Byron Place (Durham) vs Burton Place Shopping Centre (Staffordshire) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-75**: Cannon Park Shopping Centre (Coventry) vs Cannock Shopping Centre (Staffordshire) vs Denton Park Shopping Centre (Tyne And Wear) [Generic Name Match in same region (47km) [WEBSITE CONFLICT]]
- **GRP-77**: Central Square Shopping Centre (West Midlands) vs Central Square (Maghull) [Name Match but Distant (133km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-79**: Yate Shopping Centre (City Of Bristol) vs The Gate (Tyne And Wear) vs Clyde Shopping Centre (West Dunbartonshire) vs Dyce Shopping Centre (Aberdeen City) vs Park Place Shopping Centre (West Midlands) [Name Match but Distant (197km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-80**: Garden Square Shopping Centre (Hertfordshire) vs Golden Square Shopping Centre (Warrington) vs Eldon Square Shopping Centre (Newcastle) vs New Square (West Midlands) vs Bowen Square (Daventry) vs Eden Square Shopping Centre (Greater Manchester) vs Town Square (Leicestershire) [Name Match but Distant (154km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-81**: Ankerside Shopping Centre (Tamworth) vs Waterside Shopping Centre (Lincolnshire) vs Lakeside Shopping Centre (West Thurrock) vs Riverside Shopping Centre (Hemel Hempstead) vs The Riverside Shopping Centre (Lincolnshire) vs Riverside Shopping Centre (Evesham) [Name Match but Distant (128km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-82**: The Enterprise Centre (Eastbourne) vs Enterprise Centre (Kent) [Generic Name Match in same region (43km)]
- **GRP-87**: Crowngate Shopping Centre (Worcestershire) vs Crown Glass Shopping Centre (Somerset) [Name Match but Distant (92km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-90**: Highcross (Leicestershire) vs Highcross (Leicester) [Close Proximity (134m) [WEBSITE CONFLICT]]
- **GRP-93**: Merry Hill (Brierley Hill (Dudley)) vs Merry Hill Shopping Centre (West Midlands) vs The Penny Hill Centre (West Yorkshire) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-94**: Kings Square Shopping Centre (West Midlands) vs Times Square Shopping Centre (Greater London) [Name Match but Distant (177km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-96**: West One Shopping Centre (Greater London) vs Westway Centre (Somerset) [Name Match but Distant (154km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-97**: Old Square (Walsall) vs Mell Square (West Midlands) [Generic Name Match in same region (23km) [WEBSITE CONFLICT]]
- **GRP-102**: Haymarket Shopping Centre (Leicestershire) vs Old Market (Herefordshire) vs The Ryemarket Shopping Centre (West Midlands) [Name Match but Distant (126km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-103**: The Priory (Dartford) vs The Friary (Guildford) vs Priory (Dartford) vs Priory Shopping Centre (Kent) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-107**: Newlands Shopping Centre (Essex) vs Newlands Shopping Centre (Kettering) vs Shawlands Shopping Centre (Glasgow City) [Name Match but Distant (441km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-110**: St Marks Shopping Centre (Lincoln) vs St Mary Shopping Centre (City Of Bristol) [Name Match but Distant (226km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-119**: Derbion (Derbyshire) vs The Darwin Centre (Shropshire) [Name Match but Distant (89km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-120**: County Mall (Crawley) vs The Chantry Centre (Hampshire) [Name Match but Distant (91km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-122**: The Kidlington Centre (Oxfordshire) vs The Wellington Centre (Aldershot) [Name Match but Distant (73km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-123**: The Mall Wood Green (London (Wood Green)) vs The Mall Wood Green (Greater London) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-124**: Maltings Shopping Centre (Hertfordshire) vs The Maltings Shopping Centre (Staffordshire) vs The Maltings (Wiltshire) [Name Match but Distant (164km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-128**: The Quedam Centre (Somerset) vs Dundas Shopping Centre (North Yorkshire) [Name Match but Distant (416km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-129**: The Springs Shopping Centre (Derbyshire) vs The Ridings (Wakefield) [Name Match but Distant (55km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-130**: Touchwood (Solihull) vs Touchwood (West Midlands) vs Birchwood Shopping Centre (Warrington) vs Birchwood Shopping Centre (Cheshire) [Name Match but Distant (122km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-132**: Wellington Square Shopping Centre (Durham) vs Washington Square Shopping Centre (Cumbria) [Name Match but Distant (144km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-133**: Victoria Place Shopping Centre (Greater London) vs Victoria Place (Surrey) vs Victoria Gate (West Yorkshire) [Generic Name Match in same region (35km) [WEBSITE CONFLICT]]
- **GRP-137**: Woolshops (Halifax) vs Woolshops Shopping Centre (West Yorkshire) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-138**: Wulfrun Centre (Wolverhampton) vs Wulfrun Shopping Centre (West Midlands) [Close Proximity (35m) [WEBSITE CONFLICT]]
- **GRP-145**: The Grosvenor Centre (Northampton) vs Grosvenor Shopping Centre (Chester) vs Grosvenor Shopping (Northampton) vs Grosvenor Centre (Northamptonshire) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-146**: Viking Centre (Tyne And Wear) vs The Viking Centre (Jarrow) [Close Proximity (123m) [WEBSITE CONFLICT]]
- **GRP-147**: The Lexicon (Bracknell) vs Beacon Centre (Tyne And Wear) [Name Match but Distant (402km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-148**: Kingsway Shopping Centre (Newport) vs The Ridgeway Shopping Centre (Plympton) [Name Match but Distant (153km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-149**: The Britten Centre (Lowestoft) vs The Bridges (Sunderland) vs The Bridges Shopping Centre (Tyne And Wear) vs Bridgend Shopping Centre (Bridgend) vs The Britten Shopping Centre (Suffolk) [Name Match but Distant (344km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-151**: Arndale Centre (Morecambe) vs The Airedale Centre (West Yorkshire) [Name Match but Distant (67km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-152**: Kingsland Shopping Centre (Thatcham) vs Kingsgate Shopping Centre (West Yorkshire) vs Kings Walk Shopping Centre (Gloucestershire) vs Kingsgate Centre (Fife) vs Kingsland Shopping Centre (Greater London) [Name Match but Distant (201km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-155**: Green Lanes Shopping Centre (Devon) vs Green Oaks Shopping Centre (Cheshire) [Name Match but Distant (271km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-157**: The Aylesham Centre (Peckham) vs Aylesham Centre (Greater London) [Exact Postcode Match [WEBSITE CONFLICT]]
- **GRP-158**: Castle Quarter (Norfolk) vs Castle Square (Greater London) [Name Match but Distant (157km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-159**: Churchill Square (Brighton) vs Church Square Shopping Centre (Merseyside) [Name Match but Distant (344km) - Lat/Long Error? [WEBSITE CONFLICT]]
- **GRP-160**: The Concourse (Skelmersdale) vs Concourse Shopping Centre (Lancashire) [Close Proximity (0m) [WEBSITE CONFLICT]]
- **GRP-162**: Cwmbran Centre (Cwmbran) vs Cwmbran Shopping Centre (Torfaen) [Close Proximity (109m) [WEBSITE CONFLICT]]
- **GRP-163**: Ladysmith Shopping Centre (Ashton-under-Lyne) vs Ladysmith Shopping Centre (Greater Manchester) [Close Proximity (98m) [WEBSITE CONFLICT]]
- **GRP-165**: Idlewells Shopping Centre (Nottinghamshire) vs The Idlewells Centre (Sutton In Ashfield) [Exact Postcode Match [WEBSITE CONFLICT]]
