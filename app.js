const express = require("express")
const fs = require("fs")

const app = express()

const port = process.env.port || 3000

// middleware
// memodifikasi incoming request/request body ke api
app.use(express.json())

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// naming api adalah bentuk jamak, bukan verb atau objek tunggal, serta terdapat versioning
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tours 
    }
  }) // format jsend
})

app.post("/api/v1/tours", (req, res) => {
  console.log(req.body)
  console.log(req.body.name)
  const newId = tours[tours.length - 1].id + 1
  const newData = Object.assign({ id: newId }, req.body)

  tours.push(newData)
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: "success",
      data: {
        tour: newData
      }
    })
  })
})

app.get("/api/v1/tours/:id", (req, res) => { // bisa nesting params

  const id = req.params.id * 1
  const tour = tours.find(el => el.id === req.params.id)
  console.log(tour)

  if(!tour) {
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`
    })
  }
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  })
})

app.patch("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1
  const tourIndex = tours.findIndex(el => el.id === id)
  if(tourIndex === -1){
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`
    })
  }

  tours[tourIndex] = {...tours, ...req.body }

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: "success",
      data: {
        tour: tours[tourIndex]
      }
    })
  })
})

app.delete("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1

  const tourIndex = tours.findIndex(el => el.id === id)
  if(tourIndex === -1){
    return res.status(404).json({
      status: "failed",
      message: `Data with id ${id} not found`
    })
  }
  
  tours.splice(tourIndex, 1)

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: "success",
      data: null
    })
  })
})



app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})