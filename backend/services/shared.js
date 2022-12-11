//    "author": "Cydney Auman",
//    "license": "MIT",
//     Originally from express-quiz-app v1.0.0
// Some Minor Additions for common populate actions
// shared crud operations (original text)

const all = async (Model, populate_items = []) => {
    var current_promise = Model.find({});

    // Check if we need to populate our model at all
    if (populate_items.length != 0) {
        // create promises for populating the fields/paths requested
        var current_promise = Model.find({});
        for await (const [path, ignore] of populate_items) {
            current_promise = current_promise.populate(path, ignore);
        }
    }

    return await current_promise;
};

const get = async (Model, id, populate_items = []) => {
    var current_promise = Model.findById(id);

    if (populate_items.length != 0) {
        // create promises for populating the fields/paths requested
        for await (const [path, ignore] of populate_items) {
            current_promise = current_promise.populate(path, ignore);
        }
    }

    return await current_promise;
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
