package com.spoton.merchant.nav

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.spoton.merchant.data.AppViewModel
import com.spoton.merchant.data.MockData
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.screens.*
import com.spoton.merchant.ui.theme.SpotOnTheme

private fun decode(s: String?) = s?.let { java.net.URLDecoder.decode(it, "UTF-8") }

@Composable
fun SpotOnApp(vm: AppViewModel = viewModel()) {
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val args = entry?.arguments

    var showLocation by remember { mutableStateOf(false) }
    var showRange by remember { mutableStateOf(false) }
    var showMore by remember { mutableStateOf(false) }

    val isTab = BottomTabs.any { it.route == route }
    val dest = Dest.byRoute(route)
    val unread = MockData.notifications.count { it.unread }

    Scaffold(
        containerColor = SpotOnTheme.tokens.canvas,
        topBar = {
            when {
                route == Routes.LOGIN || route == null -> Unit
                isTab -> HomeTopBar(
                    title = dest?.title ?: "Dashboard",
                    locationName = vm.location.shortName,
                    rangeLabel = vm.range.label,
                    unreadCount = unread,
                    onSearch = { nav.navigate(Routes.SEARCH) },
                    onNotifications = { nav.navigate(Routes.NOTIFICATIONS) },
                    onRange = { showRange = true },
                    onLocation = { showLocation = true },
                )
                else -> DetailTopBar(
                    title = titleFor(route, decode(args?.getString("name")), decode(args?.getString("section"))),
                    subtitle = subtitleFor(route, vm),
                    onBack = { nav.popBackStack() },
                )
            }
        },
        bottomBar = {
            if (route != Routes.LOGIN && route != null) {
                SpotOnBottomBar(
                    current = route,
                    onSelect = { r ->
                        nav.navigate(r) {
                            popUpTo(Dest.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onMore = { showMore = true },
                )
            }
        },
    ) { padding ->
        // The scaffold's top inset goes to the NavHost; the bottom inset is handed
        // to each screen's list as contentPadding, so content scrolls under the bar
        // instead of being clipped by it.
        val ld = LocalLayoutDirection.current
        val listPadding = PaddingValues(
            start = padding.calculateStartPadding(ld),
            end = padding.calculateEndPadding(ld),
            top = 0.dp,
            bottom = padding.calculateBottomPadding(),
        )

        NavHost(
            navController = nav,
            startDestination = if (vm.user == null) Routes.LOGIN else Dest.Home.route,
            modifier = Modifier.padding(top = padding.calculateTopPadding()),
        ) {
            composable(Routes.LOGIN) {
                LoginScreen { email, location ->
                    vm.signIn(email)
                    vm.selectLocation(location)
                    nav.navigate(Dest.Home.route) { popUpTo(Routes.LOGIN) { inclusive = true } }
                }
            }

            // -------------------------------------------------------- tab roots
            composable(Dest.Home.route) {
                HomeScreen(
                    vm = vm,
                    onOpen = { d -> nav.navigate(d.route) },
                    onOrder = { id -> nav.navigate(Routes.orderDetail(id)) },
                    contentPadding = listPadding,
                )
            }
            composable(Dest.Sales.route) { SalesScreen(vm, listPadding) }
            composable(Dest.Orders.route) {
                OrdersScreen({ id -> nav.navigate(Routes.orderDetail(id)) }, listPadding)
            }
            composable(Dest.Menus.route) {
                MenusScreen(vm, { id -> nav.navigate(Routes.menuItem(id)) }, listPadding)
            }

            // ---------------------------------------------------- other sections
            composable(Dest.Reporting.route) {
                ReportingScreen({ r -> nav.navigate(Routes.reportDetail(r)) }, listPadding)
            }
            composable(Dest.Team.route) {
                TeamScreen(vm, { id -> nav.navigate(Routes.employeeDetail(id)) }, listPadding)
            }
            composable(Dest.Reservations.route) {
                ReservationsScreen({ nav.navigate(Routes.RESERVATION_NEW) }, listPadding)
            }
            composable(Dest.Customers.route) {
                CustomersScreen({ id -> nav.navigate(Routes.customerDetail(id)) }, listPadding)
            }
            composable(Dest.Loyalty.route) { LoyaltyScreen(listPadding) }
            composable(Dest.Campaigns.route) {
                CampaignsScreen(
                    onCampaign = { id -> nav.navigate(Routes.campaignDetail(id)) },
                    onNew = { nav.navigate(Routes.CAMPAIGN_NEW) },
                    contentPadding = listPadding,
                )
            }
            composable(Dest.Reviews.route) {
                ReviewsScreen({ id -> nav.navigate(Routes.reviewReply(id)) }, listPadding)
            }
            composable(Dest.Online.route) { OnlineOrderingScreen(vm, listPadding) }
            composable(Dest.GiftCards.route) { GiftCardsScreen(listPadding) }
            composable(Dest.Statements.route) {
                StatementsScreen({ id -> nav.navigate(Routes.depositDetail(id)) }, listPadding)
            }
            composable(Dest.Devices.route) { DevicesScreen(listPadding) }
            composable(Dest.Users.route) { UsersScreen(listPadding) }
            composable(Dest.Settings.route) {
                SettingsScreen({ s -> nav.navigate(Routes.settingsSection(s)) }, listPadding)
            }

            // --------------------------------------------------- detail screens
            composable(Routes.ORDER_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val order = MockData.orders.firstOrNull { it.id == e.arguments?.getString("id") }
                if (order != null) OrderDetailScreen(order, listPadding)
                else EmptyState("Order not found", "This ticket is no longer available.")
            }
            composable(Routes.MENU_ITEM, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val item = MockData.menuItems.firstOrNull { it.id == e.arguments?.getString("id") }
                if (item != null) MenuItemScreen(item, vm, listPadding)
                else EmptyState("Item not found", "This menu item is no longer available.")
            }
            composable(Routes.EMPLOYEE_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val emp = MockData.employees.firstOrNull { it.id == e.arguments?.getString("id") }
                if (emp != null) EmployeeDetailScreen(emp, listPadding)
                else EmptyState("Employee not found", "This person is no longer on the roster.")
            }
            composable(Routes.CUSTOMER_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val c = MockData.customers.firstOrNull { it.id == e.arguments?.getString("id") }
                if (c != null) CustomerDetailScreen(c, listPadding)
                else EmptyState("Guest not found", "This profile is no longer available.")
            }
            composable(Routes.CAMPAIGN_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val c = MockData.campaigns.firstOrNull { it.id == e.arguments?.getString("id") }
                if (c != null) CampaignDetailScreen(c, listPadding)
                else EmptyState("Campaign not found", "This campaign is no longer available.")
            }
            composable(Routes.DEPOSIT_DETAIL, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val d = MockData.deposits.firstOrNull { it.id == e.arguments?.getString("id") }
                if (d != null) DepositDetailScreen(d, listPadding)
                else EmptyState("Deposit not found", "This statement is no longer available.")
            }
            composable(Routes.REPORT_DETAIL, listOf(navArgument("name") { type = NavType.StringType })) { e ->
                ReportDetailScreen(decode(e.arguments?.getString("name")) ?: "Report", vm, listPadding)
            }
            composable(Routes.REVIEW_REPLY, listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val r = MockData.reviews.firstOrNull { it.id == e.arguments?.getString("id") }
                if (r != null) ReviewReplyScreen(r, listPadding) { nav.popBackStack() }
                else EmptyState("Review not found", "This review is no longer available.")
            }
            composable(Routes.SETTINGS_SECTION, listOf(navArgument("section") { type = NavType.StringType })) { e ->
                SettingsSectionScreen(
                    decode(e.arguments?.getString("section")) ?: "Business profile", vm, listPadding,
                )
            }

            composable(Routes.CAMPAIGN_NEW) { CampaignComposerScreen(listPadding) { nav.popBackStack() } }
            composable(Routes.RESERVATION_NEW) { ReservationComposerScreen(listPadding) { nav.popBackStack() } }
            composable(Routes.NOTIFICATIONS) { NotificationsScreen(listPadding) }
            composable(Routes.SEARCH) {
                SearchScreen(
                    onPick = { d -> nav.popBackStack(); nav.navigate(d.route) },
                    contentPadding = listPadding,
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    vm,
                    onSignOut = {
                        vm.signOut()
                        nav.navigate(Routes.LOGIN) { popUpTo(0) }
                    },
                    contentPadding = listPadding,
                )
            }
        }
    }

    if (showLocation) LocationSheet(vm.location, { vm.selectLocation(it) }) { showLocation = false }
    if (showRange) DateRangeSheet(vm.range, { vm.selectRange(it) }) { showRange = false }
    if (showMore) {
        MoreSheet(
            onPick = { d -> nav.navigate(d.route) },
            onProfile = { nav.navigate(Routes.PROFILE) },
            onDismiss = { showMore = false },
        )
    }
}

private fun titleFor(route: String, name: String?, section: String?): String = when {
    route.startsWith("order/") -> "Ticket"
    route.startsWith("menuitem/") -> "Menu item"
    route.startsWith("employee/") -> "Employee"
    route.startsWith("customer/") -> "Guest profile"
    route == Routes.CAMPAIGN_NEW -> "New campaign"
    route.startsWith("campaign/") -> "Campaign"
    route.startsWith("deposit/") -> "Deposit"
    route.startsWith("report/") -> name ?: "Report"
    route.endsWith("/reply") -> "Reply to review"
    route == Routes.RESERVATION_NEW -> "Add reservation"
    route.startsWith("settings/") -> section ?: "Settings"
    route == Routes.NOTIFICATIONS -> "Notifications"
    route == Routes.SEARCH -> "Search"
    route == Routes.PROFILE -> "Account"
    else -> Dest.byRoute(route)?.title ?: "SpotOn"
}

private fun subtitleFor(route: String, vm: AppViewModel): String? = when {
    route.startsWith("report/") -> "${vm.range.label} · ${vm.location.shortName}"
    Dest.byRoute(route) != null -> vm.location.shortName
    else -> null
}
