const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { ObjectId } = require('mongodb');
const fs = require('fs-extra');
const path = require('path');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

/**
 * FileController class handles file-related operations.
 */
class FileController {
/**
     * Handles the upload of files and folders.
     *
     * @param {Object} req - The request object.
     * @param {Object} req.headers - The headers of the request.
     * @param {string} req.headers['x-token'] - The authentication token.
     * @param {Object} req.body - The body of the request.
     * @param {string} req.body.name - The name of the file or folder.
     * @param {string} req.body.type - The type of the file or folder (folder, file, image).
     * @param {string} [req.body.parentId='0'] - The parent folder ID.
     * @param {boolean} [req.body.isPublic=false] - Whether the file or folder is public.
     * @param {string} [req.body.data] - The base64 encoded data of the file.
     * @param {Object} res - The response object.
     *
     * @returns {Promise<Object>} The response object with status and message.
     */

  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    // Step 1: Verify User Authentication
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    // Step 2: validate Input Data
    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).send({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).send({ error: 'Missing data' });
    }
    // Step 3: Validate Parent Id
    let parentFile = null;
    if (parentId !== '0') {
      parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).send({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    // Step 4: Handle folder creation
    if (type === 'folder') {
      const newFolder = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === '0' ? '0' : new ObjectId(parentId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await dbClient.db.collection('files').insertOne(newFolder);
      return res.status(201).send({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
        createdAt: newFolder.createdAt,
        updatedAt: newFolder.updatedAt,
      });
    }
    // Step 5: Handle file/image storage
    const folderPath = process.env.FOLDER_PATH || '/temp/file_manager';
    await fs.ensureDir(folderPath);
    const fileId = uuidv4();
    const filePath = path.join(folderPath, fileId);
    const decodeData = Buffer.from(data, 'base64');
    await fs.writeFile(filePath, decodeData);
    // Step 6: Store Metadata in the database
    const newFile = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : new ObjectId(parentId),
      createdAt: new Date(),
      updatedAt: new Date(),
      localPath: filePath,
    };
    const result = await dbClient.db.collection('files').insertOne(newFile);
    // Step 7: Return Response
    return res.status(201).send({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      createdAt: newFile.createdAt,
      updatedAt: newFile.updatedAt,
    });
  }

  /**
 * Retrieves a file document based on the provided ID.
 *
 * @param {object} req - The request object, containing parameters and headers.
 * @param {object} res - The response object, used to send back the appropriate
 * HTTP status and data.
 * @returns {object} The file document if found, or an error message if not found or unauthorized.
 */
  static async getShow(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);

    // If user is not authenticated, return an error
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the file document by ID and userId
    const fileDocument = await dbClient.db.collection('files').findOne({
      _id: ObjectId(id),
      userId: ObjectId(userId),
    });

    // If the file document is not found, return an error
    if (!fileDocument) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Return the file document
    return res.status(200).json(fileDocument);
  }

  /**
 * Retrieves a list of file documents for the authenticated user,
 * based on the provided parentId and page for pagination.
 *
 * @param {object} req - The request object, containing query parameters and headers.
 * @param {object} res - The response object, used to send back the appropriate
 *  HTTP status and data.
 * @returns {array} An array of file documents, or an error message if unauthorized.
 */
  static async getIndex(req, res) {
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);

    // If user is not authenticated, return an error
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get query parameters for parentId and page
    const { parentId = 0, page = 0 } = req.query;
    const pageSize = 20;

    // Find file documents for the authenticated user
    const files = await dbClient.db.collection('files')
      .find({
        userId: ObjectId(userId),
        parentId: parentId === '0' ? 0 : ObjectId(parentId),
      })
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray();

    // Return the list of file documents
    return res.status(200).json(files);
  }

  /**
   * Publishes a file by setting `isPublic` to true based on the provided ID.
   *
   * @param {object} req - The request object, containing parameters and headers.
   * @param {object} res - The response object, used to send back the appropriate
   *  HTTP status and data.
   * @returns {object} The updated file document, or an error message if not found or unauthorized.
   */
  static async putPublish(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);

    // If user is not authenticated, return an error
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the file document by ID and userId
    const fileDocument = await dbClient.db.collection('files').findOne({
      _id: ObjectId(id),
      userId: ObjectId(userId),
    });

    // If the file document is not found, return an error
    if (!fileDocument) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Update the value of isPublic to true
    await dbClient.db.collection('files').updateOne(
      { _id: ObjectId(id) },
      { $set: { isPublic: true } },
    );

    // Return the updated file document
    fileDocument.isPublic = true;
    return res.status(200).json(fileDocument);
  }

  /**
   * Unpublishes a file by setting `isPublic` to false based on the provided ID.
   *
   * @param {object} req - The request object, containing parameters and headers.
   * @param {object} res - The response object, used to send back the appropriate
   *  HTTP status and data.
   * @returns {object} The updated file document, or an error message if not found or unauthorized.
   */
  static async putUnpublish(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);

    // If user is not authenticated, return an error
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the file document by ID and userId
    const fileDocument = await dbClient.db.collection('files').findOne({
      _id: ObjectId(id),
      userId: ObjectId(userId),
    });

    // If the file document is not found, return an error
    if (!fileDocument) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Update the value of isPublic to false
    await dbClient.db.collection('files').updateOne(
      { _id: ObjectId(id) },
      { $set: { isPublic: false } },
    );

    // Return the updated file document
    fileDocument.isPublic = false;
    return res.status(200).json(fileDocument);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);

    // Find the file document by ID
    const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });

    if (!fileDocument) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Check if the file is public or if the user is authenticated and is the owner
    if (!fileDocument.isPublic && (!userId || fileDocument.userId.toString() !== userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Check if the file type is folder
    if (fileDocument.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    // Check if the file exists on disk
    if (!fs.existsSync(fileDocument.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Get the MIME type of the file based on its name
    const mimeType = mime.lookup(fileDocument.name);

    // Read and return the file content
    fs.readFile(fileDocument.localPath, (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read file' });
      }

      res.setHeader('Content-Type', mimeType);
      return res.send(data);
    });

    // Ensure a return statement at the end
    return null;
  }
}

module.exports = FileController;
