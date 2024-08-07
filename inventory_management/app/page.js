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

  const addItem = async (item) => {
    const docRef = doc(collection(firestone, 'inventory'), item)
    const docSnap = await getDoc(docRef)
  
    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
   }


 const removeItem = async (item) => {
  const docRef = doc(collection(firestone, 'inventory'), item)
  const docSnap = await getDoc(docRef)

  if(docSnap.exists()) {
    const {quantity} = docSnap.data()
    if(quantity === 1) {
      await deleteDoc(docRef)
    }
    else{
      await setDoc(docRef, {quantity: quantity - 1})
    }
  }
  await updateInventory()
 }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box width="100vh" height="100vh" display="flex" justifyContent="center" alignItems="center" gap={2}>
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