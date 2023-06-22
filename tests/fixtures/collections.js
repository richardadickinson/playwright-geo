const categories = ['landscape', 'transport', 'utilities', 'environment', 'biodiversity', 'background mapping', 'administrative']

const landscapeCollection = ['Areas of Outstanding Natural Beauty (Northern Ireland)',
                        'Ancient Woodland Inventory 2011 and 2021 (Wales)']

const transportCollection = ['OS OpenMap Local - Railway Tracks',
                            'OS VectorMap District - Railway Station',
                            'OS VectorMap District - Railway Track',
                            'OS VectorMap District - Motorway Junction',
                            'OS VectorMap District - Roundabout',
                            'OS VectorMap District - Road Tunnel',
                            'OS VectorMap District - Railway Tunnel',
                            'OS OpenMap Local - Road Tunnel',
                            'OS OpenMap Local - Road',
                            'OS OpenMap Local - Railway Tunnel']

const utilitiesCollection = ['OS OpenMap Local - Electricity Transmission Line',
                            'OS VectorMap District - Electricity Transmission Line']

const environmentCollection = ['OS OpenMap Local - Surface Water Area (Ply)',
                            'OS Open Rivers - Link',
                            'OS VectorMap District - Glasshouse',
                            'OS VectorMap District - Tidal Water',
                            'OS OpenMap Local - Woodland',
                            'OS Open Roads - Node',
                            'OS OpenMap Local - Tidal Boundary',
                            'OS OpenMap Local - Glasshouse',
                            'OS OpenMap Local - Tidal Water',
                            'OS Open Greenspace',
                            'OS Open Roads - Link',
                            'OS VectorMap District - Spot Height',
                            'OS OpenMap Local - Foreshore',
                            'OS VectorMap District - Functional Site',
                            'OS VectorMap District - Tidal Boundary',
                            'OS VectorMap District - Surface Water Line (Ln)',
                            'OS VectorMap District - Surface Water Area (Ply)',
                            'OS OpenMap Local - Surface Water Line (Ln)',
                            'OS VectorMap District - Woodland',
                            'OS VectorMap District - Building',
                            'OS OpenMap Local - Functional Site',
                            'OS OpenMap Local - Important Building',
                            'Ancient Woodland (England)',
                            'OS Open Rivers - Node',
                            'OS VectorMap District - Foreshore',
                            'OS OpenMap Local - Building',
                            'OS VectorMap District - Ornament']

const biodiversityCollection = ['Proposed Ramsar (England)',
                            'National Nature Reserves (Northern Ireland)',
                            'Local Nature Reserves (Scotland)',
                            'Special Protection Areas (Northern Ireland)',
                            'Ramsar Sites - Wetland of International Importance (Scotland)',
                            'Ancient Woodland Inventory (Scotland)',
                            'Sites of Special Scientific Interest Units (England)',
                            'Special Areas of Conservation (England)',
                            'Special Protection Area (Scotland)',
                            'National Nature Reserves (NNRs) (Wales)',
                            'Local Nature Reserves (LNRs) (Wales)',
                            'National Nature Reserves (England)',
                            'Areas of Outstanding Natural Beauty (England)',
                            'Area of Outstanding Natural Beauty (Wales)',
                            'Special Protection Areas (England)',
                            'Country Parks (Scotland)',
                            'Special Area of Conservation (Scotland)',
                            'Ramsar (England)',
                            'Special Areas of Conservation (Northern Ireland)',
                            'Potential Special Protection Areas (England)',
                            'Special ProtectionAreas (SPA) (Wales)',
                            'Ramsar Sites - Wetlands of International Importance (Wales)',
                            'National Nature Reserves (Scotland)',
                            'Areas of Special Scientific Interest (Northern Ireland)',
                            'SSSI Impact Risk Zones (England)',
                            'Local Nature Reserves (England)',
                            'Sites of Special Scientific Interest (England)']

const backgroundMappingCollection = ['OS Open Names',
                            'OS VectorMap District - Named Place']

const administrativeCollection = ['Boundary-Line - District Borough Unitary',
                            'Boundary-Line - Scotland and Wales Constituencies',
                            'Boundary-Line - Greater London Constituency',
                            'OS VectorMap District - Administrative Boundary',
                            'Boundary-Line - Historic European Regions (Ply)',
                            'Boundary-Line - County',
                            'Boundary-Line - County Electoral Division',
                            'Boundary-Line - Historic Counties',
                            'Boundary-Line - Parish',
                            'Boundary-Line - Ceremonial Counties',
                            'Boundary-Line - English Region',
                            'Boundary-Line - Country Region',
                            'Boundary-Line - Polling Districts England',
                            'Boundary-Line - High Water Line',
                            'Boundary-Line - Community Ward',
                            'Boundary-Line - Westminster Constituencies',
                            'Boundary-Line - Scotland and Wales Region',
                            'Boundary-Line - Unitary Electoral Division',
                            'Boundary-Line - District Borough Unitary Ward']

const atlasLinks = [["Boundary-Line - Greater London Constituency", "Boundary Line - Greater London Constituencies"],
                    ["Boundary-Line - Parish", "Boundary Line - District Borough Unitary"]]
//                    ["Battlefield Sites (England)", "Battlefields (England)"]]                            

export { categories, atlasLinks,
     landscapeCollection, transportCollection, utilitiesCollection, environmentCollection, 
     biodiversityCollection, backgroundMappingCollection, administrativeCollection }

export async function getCollection(collectionName) {
    switch (collectionName) {
         case 'landscape':
              return landscapeCollection
         case 'transport':
              return transportCollection
         case 'utilities':
              return utilitiesCollection
         case 'environment':
              return environmentCollection
         case 'biodiversity':
              return biodiversityCollection
         case 'background mapping':
              return backgroundMappingCollection
         case 'administrative':
              return administrativeCollection
         default:
              throw new Error('Collection name: '+collectionName+' not matched to existing collection')
    }
}