// Helper function to generate unique filenames
const generateFilename = (file) => {
    let splittedFilename = file.name.split('.');
    return splittedFilename[0] + crypto.randomUUID() + '.' + splittedFilename[splittedFilename.length - 1];
};



module.exports = { generateFilename }