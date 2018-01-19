module.exports = {
    "host" : "ds111754.mlab.com:11754",
    "mongodbHost" : "collaborative_geoanalysis:yiannis32845sm@ds111754.mlab.com:11754/",
    "dbName": "colga_db",
    "secret": "c24d4f4549b076894",
    "authentication": {
        jwtSecret: process.env.JWT_SECRET || 'secret'
    }
}