const fs = require("fs")
const os = require("os")
const crypto = require("crypto")
const express = require("express")
const morgan = require("morgan")
const app = express()

const objectId = () => {
  const secondInHex = Math.floor(new Date() / 1000).toString(16)
  const machineId = crypto
    .createHash("md5")
    .update(os.hostname())
    .digest("hex")
    .slice(0, 6)
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, "0")
  const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, "0")

  return secondInHex + machineId + processId + counter
}
// https://stackoverflow.com/questions/12797106/how-to-randomly-generate-objectid-in-node-js

const port = process.env.port || 3000

// middleware
// memodifikasi incoming request/request body ke api
app.use(express.json())
app.use(morgan("dev"))
app.use((req, res, next) => {
  console.log("hallo fsw 2")
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
)

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tours,
    },
  }) // format jsend
}

const createTour = (req, res) => {
  console.log(req.body)
  console.log(req.body.name)
  const newId = tours[tours.length - 1].id + 1
  const newData = Object.assign({ id: newId }, req.body)
  tours.push(newData)
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newData,
        },
      })
    }
  )
}

const getTourById = (req, res) => {
  // bisa nesting params
  const id = req.params.id * 1
  const tour = tours.find((el) => el.id === id)
  console.log(tour)
  if (!tour) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  })
}

const editTour = (req, res) => {
  const id = req.params.id * 1
  const tourIndex = tours.findIndex((el) => el.id === id)
  if (tourIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  tours[tourIndex] = { ...tours[tourIndex], ...req.body }
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: tours[tourIndex],
        },
      })
    }
  )
}

const deleteTour = (req, res) => {
  const id = req.params.id * 1
  const tourIndex = tours.findIndex((el) => el.id === id)
  if (tourIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  tours.splice(tourIndex, 1)
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: null,
      })
    }
  )
}

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  }) // format jsend
}

const createUser = (req, res) => {
  const newId = objectId()
  const newData = Object.assign({ _id: newId }, req.body)
  users.push(newData)
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: newData,
        },
      })
    }
  )
}

const getUserById = (req, res) => {
  // bisa nesting params
  const id = req.params.id
  const user = users.find((el) => el._id === id)
  console.log(user)
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  })
}

const editUser = (req, res) => {
  const id = req.params.id
  const userIndex = users.findIndex((el) => el._id === id)
  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  users[userIndex] = { ...users[userIndex], ...req.body }
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: users[userIndex],
        },
      })
    }
  )
}

const deleteUser = (req, res) => {
  const id = req.params.id
  const userIndex = users.findIndex((el) => el._id === id)
  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`,
    })
  }
  users.splice(userIndex, 1)
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: null,
      })
    }
  )
}

// naming api adalah bentuk jamak, bukan verb atau objek tunggal, serta terdapat versioning
// app.get("/api/v1/tours", getAllTours)
// app.post("/api/v1/tours", createTour)
// app.get("/api/v1/tours/:id", getTourById)
// app.patch("/api/v1/tours/:id", editTour)
// app.delete("/api/v1/tours/:id", deleteTour)

const tourRouter = express.Router()
const userRouter = express.Router()

// ROUTES UNTUK TOUERS
tourRouter.route("/").get(getAllTours).post(createTour)

tourRouter.route("/:id").get(getTourById).patch(editTour).delete(deleteTour)

// ROUTES UNTUK USERS
userRouter.route("/").get(getAllUsers).post(createUser)

userRouter.route("/:id").get(getUserById).patch(editUser).delete(deleteUser)

app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
