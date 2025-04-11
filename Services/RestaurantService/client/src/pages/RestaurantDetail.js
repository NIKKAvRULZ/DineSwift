const handleRatingChange = (menuItemId, updatedMenuItem) => {
    setMenuItems(prevItems => 
        prevItems.map(item => 
            item._id === menuItemId ? updatedMenuItem : item
        )
    );
};

<MenuItemCard
    key={menuItem._id}
    menuItem={menuItem}
    onDelete={handleDeleteMenuItem}
    onRatingChange={handleRatingChange}
/> 