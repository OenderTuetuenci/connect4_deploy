package controllers

import akka.actor.{ Actor, ActorRef, ActorSystem, Props }
import akka.stream.Materializer
import com.mohiva.play.silhouette.api.Silhouette
import play.api.mvc.{ AbstractController, AnyContent, ControllerComponents, WebSocket }
import utils.auth.DefaultEnv

import javax.inject.{ Inject, Singleton }
import Connect4._
import model.gridComponent.GridInterface
import controller.endGameEvent
import controller.updateGridEvent
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import com.mohiva.play.silhouette.impl.providers.GoogleTotpInfo
import play.api.libs.json.{ JsObject, Json, Writes }
import play.api.libs.streams.ActorFlow

import scala.concurrent.{ ExecutionContext, Future }
import scala.swing.Reactor

@Singleton
class Connect4Controller @Inject() (
  scc: SilhouetteControllerComponents,
  about: views.html.about,
  connect4: views.html.connect4,
  silhouette: Silhouette[DefaultEnv]
)(implicit ex: ExecutionContext, system: ActorSystem, mat: Materializer) extends SilhouetteController(scc) {
  val gameController = Connect4.controller
  val grid: GridInterface = gameController.grid

  def aboutpage = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(about(request.identity, totpInfoOpt))
    }
  }
  def connect4page = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(connect4(request.identity, totpInfoOpt))
    }
  }
  def gridToJson = silhouette.SecuredAction { implicit request =>
    Ok(Json.toJson(grid))
  }
  def gridToJsonWithMove(column: Int) = silhouette.SecuredAction { implicit request =>
    {
      gameController.move(column)
      Ok(Json.toJson(grid))
    }
  }
  implicit val gridWrites: Writes[GridInterface] = new Writes[GridInterface] {
    def writes(grid: GridInterface): JsObject = Json.obj(
      "grid" -> Json.obj(
        "cells" -> Json.toJson(for {
          row <- 0 until 6
          col <- 0 until 7
        } yield {
          Json.obj(
            "row" -> row,
            "col" -> col,
            "val" -> grid.grid(row)(col)
          )
        })
      )
    )
  }
  def socket: WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      Connect4WebSocketActorFactory.create(out)
    }
  }
  object Connect4WebSocketActorFactory {
    def create(out: ActorRef): Props = {
      Props(new Connect4WebSocketActor(out))
    }
  }

  class Connect4WebSocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo(gameController)

    override def receive: Receive = {
      case msg: String =>
        out ! Json.toJson(grid.toString)
    }

    reactions += {
      case e: updateGridEvent => sendJsonToClient("update")
      case e: endGameEvent => sendJsonToClient("end")
      //case e: blockedColumnEvent=>blockedColumn()
      //case e: saveGameEvent=>saveGame()
      //case e: updateAllGridEvent =>updateAllGrid()
    }
    def sendJsonToClient(event: String): Unit = {
      event match {
        case "update" => out ! Json.obj("event" -> "update", "grid" -> Json.toJson(grid)).toString()
        case "end" => out ! Json.obj("event" -> "end", "grid" -> Json.toJson(grid)).toString()
      }
    }
  }
}
