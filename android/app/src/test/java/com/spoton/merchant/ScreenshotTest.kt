package com.spoton.merchant

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.dp
import com.github.takahirom.roborazzi.captureRoboImage
import com.spoton.merchant.data.AppViewModel
import com.spoton.merchant.data.MockData
import com.spoton.merchant.nav.Dest
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.screens.*
import com.spoton.merchant.ui.theme.SpotOnTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Renders every screen on the JVM and writes a PNG per screen, so the UI can be
 * reviewed without an emulator. Run: `gradle :app:testDebugUnitTest`.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = "w411dp-h891dp-xhdpi", sdk = [34])
class ScreenshotTest {

    @get:Rule
    val compose = createComposeRule()

    private fun shot(name: String, content: @Composable () -> Unit) {
        compose.setContent {
            SpotOnTheme {
                androidx.compose.material3.Surface(
                    Modifier.fillMaxSize(),
                    color = SpotOnTheme.tokens.canvas,
                ) { content() }
            }
        }
        compose.onRoot().captureRoboImage("build/screens/$name.png")
    }

    private val pad = PaddingValues(0.dp)
    private fun vm() = AppViewModel().apply { signIn("owner@harborview.co") }

    @Test fun login() = shot("01-login") { LoginScreen { _, _ -> } }
    @Test fun home() = shot("02-home") { HomeScreen(vm(), {}, {}, pad) }
    @Test fun sales() = shot("03-sales") { SalesScreen(vm(), pad) }
    @Test fun reporting() = shot("04-reporting") { ReportingScreen({}, pad) }
    @Test fun reportDetail() = shot("05-report-detail") { ReportDetailScreen("Daily recap", vm(), pad) }
    @Test fun orders() = shot("06-orders") { OrdersScreen({}, pad) }
    @Test fun orderDetail() = shot("07-order-detail") { OrderDetailScreen(MockData.orders.first(), pad) }
    @Test fun menus() = shot("08-menus") { MenusScreen(vm(), {}, pad) }
    @Test fun menuItem() = shot("09-menu-item") { MenuItemScreen(MockData.menuItems.first(), vm(), pad) }
    @Test fun team() = shot("10-team") { TeamScreen(vm(), {}, pad) }
    @Test fun employee() = shot("11-employee") { EmployeeDetailScreen(MockData.employees.first(), pad) }
    @Test fun reservations() = shot("12-reservations") { ReservationsScreen({}, pad) }
    @Test fun reservationNew() = shot("13-reservation-new") { ReservationComposerScreen(pad) {} }
    @Test fun customers() = shot("14-customers") { CustomersScreen({}, pad) }
    @Test fun customer() = shot("15-customer") { CustomerDetailScreen(MockData.customers.first(), pad) }
    @Test fun loyalty() = shot("16-loyalty") { LoyaltyScreen(pad) }
    @Test fun campaigns() = shot("17-campaigns") { CampaignsScreen({}, {}, pad) }
    @Test fun campaign() = shot("18-campaign") { CampaignDetailScreen(MockData.campaigns[1], pad) }
    @Test fun campaignNew() = shot("19-campaign-new") { CampaignComposerScreen(pad) {} }
    @Test fun reviews() = shot("20-reviews") { ReviewsScreen({}, pad) }
    @Test fun reviewReply() = shot("21-review-reply") { ReviewReplyScreen(MockData.reviews[1], pad) {} }
    @Test fun online() = shot("22-online") { OnlineOrderingScreen(vm(), pad) }
    @Test fun giftCards() = shot("23-gift-cards") { GiftCardsScreen(pad) }
    @Test fun statements() = shot("24-statements") { StatementsScreen({}, pad) }
    @Test fun deposit() = shot("25-deposit") { DepositDetailScreen(MockData.deposits.first(), pad) }
    @Test fun devices() = shot("26-devices") { DevicesScreen(pad) }
    @Test fun users() = shot("27-users") { UsersScreen(pad) }
    @Test fun settings() = shot("28-settings") { SettingsScreen({}, pad) }
    @Test fun settingsReceipts() = shot("29-settings-receipts") { SettingsSectionScreen("Receipts", vm(), pad) }
    @Test fun settingsNotifications() = shot("30-settings-notifications") { SettingsSectionScreen("Notifications", vm(), pad) }
    @Test fun notifications() = shot("31-notifications") { NotificationsScreen(pad) }
    @Test fun search() = shot("32-search") { SearchScreen({}, pad) }
    @Test fun profile() = shot("33-profile") { ProfileScreen(vm(), {}, pad) }

    @Test fun topBar() = shot("34-topbar") {
        HomeTopBar("Dashboard", "Downtown", "Last 7 days", 3, {}, {}, {}, {})
    }
    @Test fun bottomBar() = shot("35-bottombar") {
        SpotOnBottomBar(Dest.Home.route, {}, {})
    }
}
