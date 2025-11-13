const { MongoClient } = require('mongodb');

class BookstoreQueries {
    constructor() {
        this.uri = "mongodb://localhost:27017";
        this.client = null;
        this.database = null;
        this.books = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            console.log("✅ Connected to MongoDB");
            this.database = this.client.db("plp_bookstore");
            this.books = this.database.collection("books");
        } catch (error) {
            console.error("❌ Connection error:", error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log("✅ Disconnected from MongoDB");
        }
    }

    // Task 2: Basic CRUD Operations

    async findBooksByGenre(genre) {
        console.log(`\n📚 Finding books in genre: ${genre}`);
        const result = await this.books.find({ genre: genre }).toArray();
        console.log(`Found ${result.length} books:`);
        result.forEach(book => {
            console.log(`- ${book.title} by ${book.author}`);
        });
        return result;
    }

    async findBooksPublishedAfter(year) {
        console.log(`\n📅 Finding books published after: ${year}`);
        const result = await this.books.find({ published_year: { $gt: year } }).toArray();
        console.log(`Found ${result.length} books:`);
        result.forEach(book => {
            console.log(`- ${book.title} (${book.published_year})`);
        });
        return result;
    }

    async findBooksByAuthor(author) {
        console.log(`\n✍️ Finding books by author: ${author}`);
        const result = await this.books.find({ author: author }).toArray();
        console.log(`Found ${result.length} books:`);
        result.forEach(book => {
            console.log(`- ${book.title} (${book.published_year})`);
        });
        return result;
    }

    async updateBookPrice(title, newPrice) {
        console.log(`\n💰 Updating price for: ${title} to $${newPrice}`);
        const result = await this.books.updateOne(
            { title: title },
            { $set: { price: newPrice } }
        );
        console.log(`Modified ${result.modifiedCount} document(s)`);
        
        // Show the updated book
        const updatedBook = await this.books.findOne({ title: title });
        console.log(`Updated book: ${updatedBook.title} - $${updatedBook.price}`);
        return result;
    }

    async deleteBookByTitle(title) {
        console.log(`\n🗑️ Deleting book: ${title}`);
        const result = await this.books.deleteOne({ title: title });
        console.log(`Deleted ${result.deletedCount} document(s)`);
        return result;
    }

    // Task 3: Advanced Queries

    async findInStockBooksAfter2010() {
        console.log(`\n✅ Finding in-stock books published after 2010`);
        const result = await this.books.find({
            in_stock: true,
            published_year: { $gt: 2010 }
        }).toArray();
        console.log(`Found ${result.length} books:`);
        result.forEach(book => {
            console.log(`- ${book.title} (${book.published_year}) - $${book.price}`);
        });
        return result;
    }

    async findBooksWithProjection() {
        console.log(`\n🎯 Using projection (title, author, price only)`);
        const result = await this.books.find(
            {},
            { projection: { title: 1, author: 1, price: 1, _id: 0 } }
        ).toArray();
        console.log("Books with limited fields:");
        result.forEach(book => {
            console.log(`- ${book.title} | ${book.author} | $${book.price}`);
        });
        return result;
    }

    async sortBooksByPrice(order = 'asc') {
        console.log(`\n📊 Sorting books by price (${order})`);
        const sortOrder = order === 'desc' ? -1 : 1;
        const result = await this.books.find()
            .sort({ price: sortOrder })
            .toArray();
        console.log(`Books sorted by price ${order}:`);
        result.forEach(book => {
            console.log(`- ${book.title}: $${book.price}`);
        });
        return result;
    }

    async paginateBooks(page = 1, limit = 5) {
        console.log(`\n📄 Pagination - Page ${page} (${limit} books per page)`);
        const skip = (page - 1) * limit;
        const result = await this.books.find()
            .skip(skip)
            .limit(limit)
            .toArray();
        console.log(`Page ${page} results:`);
        result.forEach(book => {
            console.log(`- ${book.title} by ${book.author}`);
        });
        return result;
    }

    // Task 4: Aggregation Pipeline

    async averagePriceByGenre() {
        console.log(`\n📈 Average price by genre`);
        const pipeline = [
            {
                $group: {
                    _id: "$genre",
                    averagePrice: { $avg: "$price" },
                    bookCount: { $sum: 1 }
                }
            },
            {
                $sort: { averagePrice: -1 }
            }
        ];

        const result = await this.books.aggregate(pipeline).toArray();
        console.log("Average price by genre:");
        result.forEach(genre => {
            console.log(`- ${genre._id}: $${genre.averagePrice.toFixed(2)} (${genre.bookCount} books)`);
        });
        return result;
    }

    async authorWithMostBooks() {
        console.log(`\n👑 Author with most books`);
        const pipeline = [
            {
                $group: {
                    _id: "$author",
                    bookCount: { $sum: 1 }
                }
            },
            {
                $sort: { bookCount: -1 }
            },
            {
                $limit: 1
            }
        ];

        const result = await this.books.aggregate(pipeline).toArray();
        console.log("Author with most books:");
        result.forEach(author => {
            console.log(`- ${author._id}: ${author.bookCount} books`);
        });
        return result;
    }

    async booksByPublicationDecade() {
        console.log(`\n📅 Books by publication decade`);
        const pipeline = [
            {
                $addFields: {
                    decade: {
                        $multiply: [
                            { $floor: { $divide: ["$published_year", 10] } },
                            10
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$decade",
                    bookCount: { $sum: 1 },
                    books: { $push: "$title" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];

        const result = await this.books.aggregate(pipeline).toArray();
        console.log("Books by publication decade:");
        result.forEach(decade => {
            console.log(`- ${decade._id}s: ${decade.bookCount} books`);
        });
        return result;
    }

    // Task 5: Indexing

    async createIndexes() {
        console.log(`\n⚡ Creating indexes for performance`);
        try {
            // Single index on title
            await this.books.createIndex({ title: 1 });
            console.log("✅ Index created on title field");

            // Compound index on author and published_year
            await this.books.createIndex({ author: 1, published_year: 1 });
            console.log("✅ Compound index created on author and published_year");

            console.log("🎉 All indexes created successfully");
        } catch (error) {
            console.error("Error creating indexes:", error);
        }
    }

    async demonstrateIndexPerformance() {
        console.log(`\n🚀 Demonstrating index performance`);
        try {
            // This is a simplified demonstration
            console.log("Indexes help with:");
            console.log("- Faster searches by title");
            console.log("- Faster queries by author and year");
            console.log("- Better performance for sorting and filtering");
            
            // Show existing indexes
            const indexes = await this.books.indexes();
            console.log("\nCurrent indexes:");
            indexes.forEach((index, i) => {
                console.log(`${i + 1}. ${JSON.stringify(index.key)}`);
            });
        } catch (error) {
            console.error("Error in performance demonstration:", error);
        }
    }

    // Run all queries
    async runAllQueries() {
        try {
            await this.connect();

            console.log("====================================");
            console.log("📚 PLP BOOKSTORE - MONGODB ASSIGNMENT");
            console.log("====================================");

            console.log("\n=== TASK 2: BASIC CRUD OPERATIONS ===");
            await this.findBooksByGenre("Fantasy");
            await this.findBooksPublishedAfter(2000);
            await this.findBooksByAuthor("J.K. Rowling");
            await this.updateBookPrice("The Hobbit", 20.99);
            await this.deleteBookByTitle("1984");

            console.log("\n=== TASK 3: ADVANCED QUERIES ===");
            await this.findInStockBooksAfter2010();
            await this.findBooksWithProjection();
            await this.sortBooksByPrice('asc');
            await this.sortBooksByPrice('desc');
            await this.paginateBooks(1, 5);
            await this.paginateBooks(2, 5);

            console.log("\n=== TASK 4: AGGREGATION PIPELINE ===");
            await this.averagePriceByGenre();
            await this.authorWithMostBooks();
            await this.booksByPublicationDecade();

            console.log("\n=== TASK 5: INDEXING ===");
            await this.createIndexes();
            await this.demonstrateIndexPerformance();

            console.log("\n🎉 ALL TASKS COMPLETED SUCCESSFULLY!");

        } catch (error) {
            console.error("❌ Error running queries:", error);
        } finally {
            await this.disconnect();
        }
    }
}

// Execute all queries
async function main() {
    const bookstore = new BookstoreQueries();
    await bookstore.runAllQueries();
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = BookstoreQueries;