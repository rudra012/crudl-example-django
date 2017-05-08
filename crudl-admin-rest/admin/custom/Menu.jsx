import React from 'react'

class Menu extends React.Component {

    static propTypes = {
        views: React.PropTypes.object.isRequired,
        resolvePath: React.PropTypes.func.isRequired,
        MenuContainer: React.PropTypes.func.isRequired,
        MenuGroup: React.PropTypes.func.isRequired,
        MenuItem: React.PropTypes.func.isRequired,
    }

    render() {
        const { views, resolvePath, MenuContainer, MenuGroup, MenuItem } = this.props
        return (
            <MenuContainer>
                <MenuGroup label="Blog Application">
                    <MenuItem
                        label="Entries"
                        listPath={resolvePath(views.entries.listView.path)}
                        addPath={resolvePath(views.entries.addView.path)}
                        />
                    <MenuItem
                        label="Sections"
                        listPath={resolvePath(views.sections.listView.path)}
                        addPath={resolvePath(views.sections.addView.path)}
                        />
                </MenuGroup>
                <MenuGroup label="Admin">
                    <MenuItem
                        label="Users"
                        listPath={resolvePath(views.users.listView.path)}
                        addPath={resolvePath(views.users.addView.path)}
                        />
                </MenuGroup>
            </MenuContainer>
        )
    }
}

export default Menu
