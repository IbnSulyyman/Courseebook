Parse.initialize("YOUR_APPLICATION_ID", "YOUR_JAVASCRIPT_KEY"); // Replace with your actual keys!
Parse.serverURL = 'https://parseapi.back4app.com';

Parse.Cloud.define("signup", async (request) => {
    const { name, email, password } = request.params; // Get parameters from request.params

    const user = new Parse.User();
    user.set("username", email);
    user.set("email", email);
    user.set("password", password);
    user.set("name", name); // Custom field for user name

    try {
        await user.signUp();
        return { message: "User signed up successfully!" }; // Return a JSON-like object
    } catch (error) {
        throw new Parse.Error(error.code, error.message); // Throw Parse Errors to be handled on client-side
    }
});

Parse.Cloud.define("login", async (request) => {
    const { email, password } = request.params;

    try {
        const user = await Parse.User.logIn(email, password);
        return { message: "Login successful!", user: { objectId: user.id } }; // Return user objectId
    } catch (error) {
        throw new Parse.Error(error.code, error.message);
    }
});

Parse.Cloud.define("getUserName", async (request) => {
    const userId = request.params.userId;

    const query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);

    try {
        const user = await query.first();
        if (user) {
            const userName = user.get("name");
            return { name: userName };
        } else {
            throw new Parse.Error(141, "User not found"); // Custom Parse Error for user not found
        }
    } catch (error) {
        throw new Parse.Error(error.code, error.message);
    }
});

Parse.Cloud.define("uploadMaterial", async (request) => {
    try {
        const { title, university, faculty, department, course, courseLevel, materialType, base64File, filename } = request.params;

        if (!title || !university || !faculty || !department || !course || !base64File || !filename) {
            throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "Missing required fields");
        }

        const fileBuffer = Buffer.from(base64File, 'base64');
        const parseFile = new Parse.File(filename, fileBuffer);
        await parseFile.save();

        const material = new Parse.Object("Materials");
        material.set("title", title);
        material.set("university", university);
        material.set("faculty", faculty);
        material.set("department", department);
        material.set("course", course);
        material.set("courseLevel", courseLevel || "");
        material.set("materialType", materialType || "");
        material.set("materialFile", parseFile);

        await material.save();

        return { message: "Material uploaded successfully!", materialId: material.id };

    } catch (error) {
        console.error("Cloud Function Error (uploadMaterial):", error); // Keep server-side logging for debugging
        throw new Parse.Error(error.code || 1, error.message || "Failed to upload material"); // Throw Parse Error
    }
});

Parse.Cloud.define("getMaterials", async (request) => {
    try {
        const { university, faculty, department, course } = request.params;

        const query = new Parse.Query("Materials");

        if (university) query.equalTo("university", university);
        if (faculty) query.equalTo("faculty", faculty);
        if (department) query.equalTo("department", department);
        if (course) query.equalTo("course", course);

        const materials = await query.find();
        return materials.map(material => ({
            objectId: material.id,
            title: material.get("title"),
            university: material.get("university"),
            faculty: material.get("faculty"),
            department: material.get("department"),
            course: material.get("course"),
            courseLevel: material.get("courseLevel"),
            materialType: material.get("materialType"),
            materialFileURL: material.get("materialFile")?.url(),
            createdAt: material.createdAt,
            updatedAt: material.updatedAt,
        }));

    } catch (error) {
        throw new Parse.Error(error.code, error.message);
    }
});