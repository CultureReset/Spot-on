package com.spoton.merchant

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasSetTextAction
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.ComposeTestRule
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.spoton.merchant.nav.SpotOnApp
import com.spoton.merchant.ui.theme.SpotOnTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Composes the real navigation graph and walks sign-in end to end, so a broken
 * route or a crash on first frame fails the build rather than the device.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = "w411dp-h891dp-xhdpi", sdk = [34])
class NavigationSmokeTest {

    @get:Rule
    val compose = createComposeRule()

    private fun settle() {
        compose.mainClock.advanceTimeBy(1_500)
        compose.waitForIdle()
    }

    @Test
    fun `app starts on the sign-in screen`() {
        compose.setContent { SpotOnTheme { SpotOnApp() } }
        compose.onNodeWithText("Sign in").assertIsDisplayed()
        compose.onNodeWithText("Use the demo account").assertIsDisplayed()
    }

    @Test
    fun `sign-in walks all four steps through to the dashboard`() {
        compose.setContent { SpotOnTheme { SpotOnApp() } }

        // 1 — email
        compose.onNodeWithText("Use the demo account").performClick()
        compose.onNode(hasText("Continue") and hasClickAction()).performClick()
        settle()
        compose.onNodeWithText("Enter your password").assertIsDisplayed()

        // 2 — password
        compose.onAllNodes_(hasSetTextAction()).onFirst().performTextInput("demo1234")
        compose.onNode(hasText("Sign in") and hasClickAction()).performClick()
        settle()
        compose.onNodeWithText("Verify it's you").assertIsDisplayed()

        // 3 — two-factor
        compose.onNodeWithText("Fill demo code").performClick()
        compose.onNode(hasText("Verify") and hasClickAction()).performClick()
        settle()
        compose.onNodeWithText("Choose a location").assertIsDisplayed()

        // 4 — location, then the dashboard itself
        compose.onNodeWithText("Harborview Kitchen — Downtown").performClick()
        settle()
        compose.onNodeWithText("Insights").assertIsDisplayed()
        compose.onNodeWithText("NET SALES").assertIsDisplayed()
    }

    @Test
    fun `bottom navigation reaches every tab`() {
        compose.setContent { SpotOnTheme { SpotOnApp() } }
        compose.onNodeWithText("Use the demo account").performClick()
        compose.onNode(hasText("Continue") and hasClickAction()).performClick(); settle()
        compose.onAllNodes_(hasSetTextAction()).onFirst().performTextInput("demo1234")
        compose.onNode(hasText("Sign in") and hasClickAction()).performClick(); settle()
        compose.onNodeWithText("Fill demo code").performClick()
        compose.onNode(hasText("Verify") and hasClickAction()).performClick(); settle()
        compose.onNodeWithText("Harborview Kitchen — Downtown").performClick(); settle()

        listOf("Sales", "Orders", "Menus").forEach { tab ->
            compose.onAllNodes_(hasText(tab)).onFirst().performClick()
            settle()
        }
        // back to the dashboard
        compose.onAllNodes_(hasText("Dashboard")).onFirst().performClick()
        settle()
        compose.onNodeWithText("Insights").assertIsDisplayed()
    }
}

/** `onAllNodes` lives on the finder interface; this keeps the call sites short. */
private fun ComposeTestRule.onAllNodes_(matcher: androidx.compose.ui.test.SemanticsMatcher) =
    onAllNodes(matcher)
