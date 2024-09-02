const { v4: uuidv4 } = require('uuid');
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
}

module.exports = FileController;
