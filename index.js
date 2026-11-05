
import express from "express"
import { MongoClient, ObjectId } from "mongodb"
import cors from "cors"
import "dotenv/config"
import { createRemoteJWKSet, jwtVerify } from "jose"

const app = express()

app.use(express.json())
app.use(cors())


const port = process.env.PORT || 5000

// MongoDB Connection
const client = new MongoClient(
    `mongodb+srv://${process.env.MONGODB_USESRNAME}:${process.env.MONGODB_PASSWOED}@cluster0.4dwew1j.mongodb.net/`
)

async function connectToMongoDB() {
    try {
        await client.connect()
        console.log("You successfully connected to MongoDB!")
    } catch (error) {
        console.error("MongoDB Connection Error:", error)
        throw error
    }
}

// Database & Collections
await connectToMongoDB()

const db = client.db("studio-space")

const studioCollection = db.collection("studios")
const booking = db.collection("booking")

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to my Server")
})

// Better Auth JWKS
const JWKS = createRemoteJWKSet(
    new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
);

// Verify Better Auth Token
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized. Token required.",
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: "Token is missing.",
        });
    }

    try {
        await jwtVerify(token, JWKS);

        // IMPORTANT: next() only once
        return next();

    } catch (error) {
        console.error("Token Verification Error:", error);

        return res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
};


// ========================================
// ADD STUDIO
// ========================================
app.post("/add-studio",verifyToken, async (req, res) => {
    try {
        const data = req.body

        const result = await studioCollection.insertOne(data)

        res.status(201).json({
            message: "Studio added successfully",
            result,
        })
    } catch (error) {
        console.error("Add Studio Error:", error)

        res.status(500).json({
            message: "Failed to add studio",
        })
    }
})

// ========================================
// GET ALL STUDIOS
// ========================================
app.get("/add-studio", async (req, res) => {
    try {
        const result = await studioCollection.find().toArray()

        res.status(200).json(result)
    } catch (error) {
        console.error("Fetch Studios Error:", error)

        res.status(500).json({
            message: "Failed to fetch studios",
        })
    }
})

// ========================================
// GET SINGLE STUDIO
// ========================================
app.get("/add-studio/:id",  async (req, res) => {

    try {
        const { id } = req.params

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid studio ID",
            })
        }

        const result = await studioCollection.findOne({
            _id: new ObjectId(id),
        })

        if (!result) {
            return res.status(404).json({
                message: "Studio not found",
            })
        }

        res.status(200).json(result)
    } catch (error) {
        console.error("Single Studio Error:", error)

        res.status(500).json({
            message: "Failed to fetch studio",
        })
    }
})

// ========================================
// MY LISTINGS - OWNER EMAIL
// ========================================
app.get("/my-listings/:email",verifyToken, async (req, res) => {
    try {
        const { email } = req.params

        const result = await studioCollection
            .find({ "owner.email": email })
            .toArray()

        res.status(200).json(result)
    } catch (error) {
        console.error("My Listings Error:", error)

        res.status(500).json({
            message: "Failed to fetch listings",
        })
    }
})

// ========================================
// CREATE BOOKING
// New booking always Pending
// ========================================
app.post("/booking", async (req, res) => {
    try {
        const data = {
            ...req.body,
            status: "Pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        const result = await booking.insertOne(data)

        res.status(201).json({
            message: "Booking created successfully",
            result,
        })

        console.log("New Booking Created")
    } catch (error) {
        console.error("Create Booking Error:", error)

        res.status(500).json({
            message: "Failed to create booking",
        })
    }
})

// ========================================
// GET ALL BOOKINGS
// ========================================
app.get("/booking", async (req, res) => {
    try {
        const result = await booking.find().toArray()

        res.status(200).json(result)
    } catch (error) {
        console.error("Fetch Bookings Error:", error)

        res.status(500).json({
            message: "Failed to fetch bookings",
        })
    }
})

// ========================================
// CUSTOMER BOOKINGS - CUSTOMER EMAIL
// ========================================
app.get("/booking/:email",verifyToken, async (req, res) => {
    try {
        const { email } = req.params

        const result = await booking
            .find({ customerEmail: email })
            .toArray()

        res.status(200).json(result)
    } catch (error) {
        console.error("Customer Bookings Error:", error)

        res.status(500).json({
            message: "Failed to fetch customer bookings",
        })
    }
})

// ========================================
// OWNER BOOKINGS - OWNER EMAIL
// ========================================
app.get("/bookingowner/:email",verifyToken, async (req, res) => {
    try {
        const { email } = req.params

        const result = await booking
            .find({ ownerEmail: email })
            .toArray()

        res.status(200).json(result)
    } catch (error) {
        console.error("Owner Bookings Error:", error)

        res.status(500).json({
            message: "Failed to fetch owner bookings",
        })
    }
})

// ========================================
// UPDATE STUDIO
// ========================================
app.patch("/update-studio/:id", verifyToken,async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid studio ID",
            })
        }

        const result = await studioCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        if (!result.matchedCount) {
            return res.status(404).json({
                message: "Studio not found",
            })
        }

        res.status(200).json({
            message: "Studio updated successfully",
            result,
        })
    } catch (error) {
        console.error("Update Studio Error:", error)

        res.status(500).json({
            message: "Failed to update studio",
        })
    }
})

// ========================================
// UPDATE BOOKING STATUS - OWNER
// ========================================
app.patch("/UpdateBooking/:email", async (req, res) => {
    try {
        const { email } = req.params
        const { bookingId, status } = req.body

        // Validate Booking ID
        if (!ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID",
            })
        }

        // Allowed Status Transitions
        const allowedTransitions = {
            Pending: ["Confirmed", "Cancelled"],
            Confirmed: ["Completed", "Cancelled"],
            Completed: [],
            Cancelled: [],
        }

        // Find Booking Belonging to This Owner
        const existingBooking = await booking.findOne({
            _id: new ObjectId(bookingId),
            ownerEmail: email,
        })

        if (!existingBooking) {
            return res.status(404).json({
                message: "Booking not found",
            })
        }

        const currentStatus = existingBooking.status || "Pending"

        // Validate Status Transition
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change ${currentStatus} to ${status}`,
            })
        }

        // Update Booking
        const result = await booking.updateOne(
            {
                _id: new ObjectId(bookingId),
                ownerEmail: email,
            },
            {
                $set: {
                    status,
                    updatedAt: new Date().toISOString(),
                },
            }
        )

        res.status(200).json({
            message: "Booking status updated successfully",
            result,
        })

        console.log(
            `Booking ${bookingId} updated: ${currentStatus} -> ${status}`
        )
    } catch (error) {
        console.error("Booking Update Error:", error)

        res.status(500).json({
            message: "Failed to update booking",
        })
    }
})

// ========================================
// DELETE STUDIO
// ========================================
app.delete("/delete-studio/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid studio ID",
            })
        }

        const result = await studioCollection.deleteOne({
            _id: new ObjectId(id),
        })

        if (!result.deletedCount) {
            return res.status(404).json({
                message: "Studio not found",
            })
        }

        res.status(200).json({
            message: "Studio deleted successfully",
            result,
        })
    } catch (error) {
        console.error("Delete Studio Error:", error)

        res.status(500).json({
            message: "Failed to delete studio",
        })
    }
})

// ========================================
// DELETE BOOKING
// ========================================
app.delete("/bookingdelet/:id", async (req, res) => {
    try {
        const { id } = req.params

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booking ID",
            })
        }

        const result = await booking.deleteOne({
            _id: new ObjectId(id),
        })

        if (!result.deletedCount) {
            return res.status(404).json({
                message: "Booking not found",
            })
        }

        res.status(200).json({
            message: "Booking deleted successfully",
            result,
        })
    } catch (error) {
        console.error("Delete Booking Error:", error)

        res.status(500).json({
            message: "Failed to delete booking",
        })
    }
})
app.get("/studiolimit", async (req, res) => {
    const result = await studioCollection.find().limit(6).toArray()
    res.send(result)
})

// ========================================
// START SERVER
// ========================================
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
