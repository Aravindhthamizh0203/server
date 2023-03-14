import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function connect() {
    const mongod = await MongoMemoryServer.create();
    const geturi = mongod.getUri();
    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(geturi);
    console.log('database connected');
    return db;

}








export default connect;