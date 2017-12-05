module.exports = {
    "host" : "ds111754.mlab.com:11754",
    "mongodbHost" : "collaborative_geoanalysis:yiannis32845sm@ds111754.mlab.com:11754/",
    "dbName": "colga_db",
    "authentication": {
        jwtSecret: process.env.JWT_SECRET || 'secret'
    }
}