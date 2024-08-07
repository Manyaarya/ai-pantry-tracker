'use client'
import Image from "next/image"
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase"
import { Box, Typography } from "@mui/material"
import { query, collection, getDocs } from "firebase/firestore"

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState([])
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'inventory')))
    const inventoryList = []
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box>
      <Typography variant="h1">
        Inventory Management
      </Typography>
      {inventory.map((item) => (
        <Box key={item.name}>
          {item.name} - {item.count}
        </Box>
      ))}
    </Box>
  )
}