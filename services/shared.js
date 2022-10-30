//    "author": "Cydney Auman",
//    "license": "MIT",
//     Originally from express-quiz-app v1.0.0
// shared crud operations

const all = async (Model) => {
    const data = await Model.find({});
    return data;
};

const get = async (Model, id) => {
    const data = await Model.findById(id);
    return data;
};

const create = async (Model, body) => {
    const data = await Model.create(body);
    return data;
};

const update = async (Model, id, body) => {
    const data = await Model.findByIdAndUpdate(id, body, {
        returnDocument: 'after',
    });
    return data;
};

const remove = async (Model, id) => {
    const data = await Model.findByIdAndDelete(id);
    return data;
};

module.exports = {
    all,
    create,
    get,
    update,
    remove,
};
