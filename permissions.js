const main = require('./main');

let ownerOnly = [];
for(let u of main.getOwnerID()) {
    ownerOnly.push({
        id: u,
        type: 'USER',
        permission: true
    });
}
ownerOnly = ownerOnly.length > 10 ? [{
    id: main.getTeamOwner(),
    type: 'USER',
    permission: true
}] : ownerOnly;

module.exports.ownerOnly = ownerOnly;